import { UserVisibleError } from "./Error";
import Employee, { IEmployee, TID, TInputManager, TManager, TName, TTotalDirectReports } from "./Employee";

export interface IEmployeeDetail {
  id: TID;
  name: TName;
  managers: TName[];
  totDirectReport: TTotalDirectReports;
  totIndirectReport: TTotalDirectReports;
}

enum IncDec {
  increment,
  decrement
}

enum Conn {
  connect,
  disconnect
}

class OrgChart {
  private nameHashmap : Map<TName, Employee[]>;
  private idHashmap : Map<TID, Employee>;
  private employeeWithoutManager : Set<TID>;

  constructor() {
    this.resetChart();
  }

  /**
   * Reset organization's chart
   */
  resetChart() {
    this.nameHashmap = new Map();
    this.idHashmap = new Map();
    this.employeeWithoutManager = new Set();
  }

  getIdHashmapValue() {
    return this.idHashmap;
  }

  getNameHashmapValue() {
    return this.nameHashmap;
  }

  getEmployeeWithoutManagerValue() {
    return this.employeeWithoutManager;
  }

  /**
   * add new employee to hashmap for faster search, and on tree
   * @param data to insert
   * @returns new employee object
   */
  addEmployee(data:IEmployee) : Employee {
    if (!data.managerId) data.managerId = null;

    const isEmployeeIdExist = this.idHashmap.get(data.id);
    if (isEmployeeIdExist) {
      // name === '' means its a unregistered employee who have direct reports
      if (isEmployeeIdExist.name === '') {
        return this.updateEmployee(data);
      }
      throw new UserVisibleError(`User with ID ${data.id} already exists`);
    }

    const newEmployee = new Employee(data);
    this.registerEmployeeIdToHashmap(newEmployee);
    if (newEmployee.name !== '') this.registerEmployeeNameToHashmap(newEmployee);
    this.connectEmployeeToManager(newEmployee, data.managerId);
    return newEmployee;
  }

  /**
   * add multiple employees from array
   * @param array of datas to insert
   */
  addEmployeesFromArray(datas:IEmployee[]) {
    datas.map((data) => {
      this.addEmployee(data);
    });
  }

  /**
   * find employees by their names, if multiple employee have the same name, will return all of their data
   * @param name of employee
   * @returns array of employee's detail
   */
  findEmployeeByName(name: TName) : IEmployeeDetail[] {
    const employeesWithSameName = this.nameHashmap.get(name);
    if (employeesWithSameName) {
      return employeesWithSameName.map((employee) => {
        const totalDirectReports = employee.directReports.length;
        return {
          id: employee.id,
          name: employee.name,
          managers: employee.manager instanceof Employee ? this.getEmployeeManagers(employee.manager) : [],
          totDirectReport: totalDirectReports,
          totIndirectReport: employee.totalDirectReports - totalDirectReports,
        };
      });
    } else return [];
  }

  /**
   * update employee's data, based on their id
   * @param data employees to update
   */
  updateEmployee(data:IEmployee) : Employee {
    const employee = this.idHashmap.get(data.id);
    if (employee) {
      if (data.name !== '' && employee.name !== data.name) {
        this.unregisterEmployeeNameFromHashmap(employee);
        employee.name = data.name;
        this.registerEmployeeNameToHashmap(employee);
      }
      if (typeof data.managerId !== 'undefined' && this.checkIfChangingManager(data, employee)) {
        this.disconnectEmployeeFromManager(employee);
        this.connectEmployeeToManager(employee, data.managerId);
      }
      return employee;
    }
    throw new UserVisibleError('Cannot update unregistered employee ID');
  }

  /**
   * delete employee data and assign their direct report to their manager
   * @param id of the employee to be deleted
   */
  deleteEmployee(id:TID) {
    const employee = this.idHashmap.get(id);
    if (employee) {
      const manager = employee.manager;
      if (manager instanceof Employee) {
        manager.directReports = [...manager.directReports, ...employee.directReports];
        employee.directReports.map((directReport) => {
          this.connectEmployeeToManager(directReport, manager.id);
        });
      }
      this.disconnectEmployeeFromManager(employee);
      this.unregisterEmployeeIdFromHashmap(employee);
      this.unregisterEmployeeNameFromHashmap(employee);
      if (employee.manager === null) this.employeeWithoutManager.delete(employee.id);
    } else {
      throw new UserVisibleError('Cannot delete unregistered employee ID');
    }
  }

  // private increaseMaxId() {
  //   this.maxId++;
  // }

  private registerEmployeeIdToHashmap(employee: Employee) {
    this.idHashmap.set(employee.id, employee);
  }

  private unregisterEmployeeIdFromHashmap(employee: Employee) {
    this.idHashmap.delete(employee.id);
  }

  /**
   * insert employee name and object into the name list of all employees.
   * @param employee the employee object that will registered
   */
  private registerEmployeeNameToHashmap(employee: Employee) {
    const employeesWithSameName = this.nameHashmap.get(employee.name);
    if (employeesWithSameName) {
      this.nameHashmap.set(employee.name, [...employeesWithSameName, employee]);
    } else this.nameHashmap.set(employee.name, [employee]);
  }

  /**
   * remove employee name and object into the name list of all employees.
   * @param employee the employee object that will registered
   */
  private unregisterEmployeeNameFromHashmap(employee:Employee) {
    const employeesWithSameName = this.nameHashmap.get(employee.name);
    if (employeesWithSameName && employeesWithSameName.length > 1) {
      const indexToDelete = employeesWithSameName.findIndex((data) => {
        return data.id === employee.id;
      });
      if (indexToDelete >= 0) employeesWithSameName.splice(indexToDelete, 1);
    } else this.nameHashmap.delete(employee.name);
  }

  /**
   * add a connection between employee and manager
   * @param employee the employee object that will be connected to a manager
   * @param managerId id of the manager that will be connected to the employee
   */
  private connectEmployeeToManager(employee:Employee, managerId:TInputManager) {
    if (managerId !== null) {
      let manager = this.idHashmap.get(managerId);
      if (!manager) { //create new manager object if its not exist yet
        manager = this.addEmployee({
          id: managerId,
          name: '',
        });
      }
      this.updateConnectionEmployeeAndManager(manager, employee, Conn.connect);
      try {
        this.incrementDecrementManagersDirectReportCount(manager, employee.totalDirectReports + 1, IncDec.increment);
      } catch (error) {
        if (error instanceof UserVisibleError) {
          this.updateConnectionEmployeeAndManager(manager, employee, Conn.disconnect);
          throw error;
        }
      }
    } else {
      this.registerEmployeeWithoutManagerToHashmap(employee);
    }
  }

  /**
   * remove the connection between employee and manager
   * @param employee the employee object that will be disconnected from a manager
   */
  private disconnectEmployeeFromManager(employee: Employee) {
    if (employee.manager instanceof Employee) {
      this.incrementDecrementManagersDirectReportCount(employee.manager, employee.totalDirectReports + 1, IncDec.decrement);
      this.updateConnectionEmployeeAndManager(employee.manager, employee, Conn.disconnect);
    }
  }

  /**
   * add an employee to a list of employees who do not have a manager
   * @param employee the employee object that will registered
   */
  private registerEmployeeWithoutManagerToHashmap(employee: Employee) {
    this.employeeWithoutManager.add(employee.id);
  }

  /**
   * create / delete a 2 way connection / link between employee and manager object
   * @param manager the manager object that will be connected to the employee
   * @param employee the employee object that will be connected to the manager
   * @param conn connect / disconnect enum
   */
  private updateConnectionEmployeeAndManager(manager:Employee, employee:Employee, conn: Conn) {
    if (conn === Conn.connect) {
      if (employee.manager === null) this.employeeWithoutManager.delete(employee.id);
      manager.directReports.push(employee);
      employee.manager = manager;
    } else if (conn === Conn.disconnect) {
      const indexToDelete = manager.directReports.findIndex((data) => {
        return data.id === employee.id;
      });
      if (indexToDelete >= 0) manager.directReports.splice(indexToDelete, 1);
      employee.manager = null;
      this.employeeWithoutManager.add(employee.id);
    }
  }

  /**
   * increase/decrease the total number of direct reports of a manager to his/her supervisor
   * @param manager the manager object that will
   * @param numberDirectReport object manager whose the number of direct reports will be increased/decreased
   * @param incdec number of how much the value will increase/decrease
   */
  private incrementDecrementManagersDirectReportCount(manager:Employee, numberDirectReport:number, incdec : IncDec, incrementHistory : Map<TID, Employee> = new Map()) {
    if (incdec === IncDec.increment) {
      //if the organizational structure form a circle pattern, cancel the increment recursive, and revert back
      if (incrementHistory.has(manager.id)) {
        incrementHistory.forEach((value) => {
          value.totalDirectReports -= numberDirectReport;
        });
        throw new UserVisibleError('organizational structure should not form a circle');
      }
      manager.totalDirectReports += numberDirectReport;
      incrementHistory.set(manager.id, manager);
    } else manager.totalDirectReports -= numberDirectReport;
    if (manager.manager !== null) this.incrementDecrementManagersDirectReportCount(manager.manager, numberDirectReport, incdec, incrementHistory);
  }

  /**
   * create an array of the name of all managers of an employee
   * @param manager the manager object of an employee
   * @returns array of the name of all managers of an employee
   */
  private getEmployeeManagers(manager: Employee) : TName[] {
    if (manager.manager instanceof Employee) {
      return [manager.name, ...(this.getEmployeeManagers(manager.manager))];
    }
    return [manager.name];
  }

  /**
   * check if managers's of employee changed from the data passed
   * @param newData data from employee updates
   * @param currentData current data of an employee
   * @returns boolean if manager of an employee changed
   */
  private checkIfChangingManager(newData:IEmployee, currentData:Employee) : boolean {
    if (typeof newData.managerId !== 'undefined') {
      const newManagerId = newData.managerId;
      const currentManagerId = this.getManagerId(currentData.manager);
      return newManagerId !== currentManagerId;
    }
    return false;
  }

  /**
   * get manager's user id
   * @param manager the manager object or null value
   * @returns manager's id in number or null
   */
  private getManagerId(manager:TManager) : number|null {
    if (manager instanceof Employee) return manager.id;
    return manager;
  }

  /**
   * check if there is more than one employee who does not have a manager, and check if there is an employee who does not have a manager and has no direct reports.
   * @returns array of anomalies
   */
  checkChartAnomalies() : string[] {
    const result = [];
    if (this.employeeWithoutManager.size > 1) result.push(`${this.employeeWithoutManager.size} employee(s) don't have manager.`);
    this.employeeWithoutManager.forEach((key) => {
      const employee = this.idHashmap.get(key);
      if (employee && employee.manager === null && employee.directReports.length === 0) {
        result.push(`${employee.name} (id:${employee.id}) don't have manager and direct reports.`);
      }
    });
    return result;
  }

}

export default OrgChart;