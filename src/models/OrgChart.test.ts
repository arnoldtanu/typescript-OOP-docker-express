import { IEmployee } from "./Employee";
import { UserVisibleError } from "./Error";
import OrgChart from "./OrgChart";

const employees : IEmployee[] = [
  { //0
    id: 1,
    name: 'adam',
    managerId: 99,
  },
  { //1
    id: 2,
    name: 'eve',
    managerId: 99,
  },
  { //2
    id: 99,
    name: 'lancelot',
    managerId: null,
  },
  { //3
    id: 100,
    name: 'arthur',
    managerId: null,
  },
  { //4
    id: 4,
    name: 'adam',
    managerId: 2,
  },
];

describe('OrgChart', () => {
  let orgChart: OrgChart;

  beforeAll(() => {
    orgChart = new OrgChart();
  });

  const getOrgChartValue = () => {
    return {
      idHashmap: orgChart.getIdHashmapValue(),
      nameHashmap: orgChart.getNameHashmapValue(),
      employeeWithoutManager: orgChart.getEmployeeWithoutManagerValue(),
    };
  };

  it('should have only 2 employee (adam & unknown manager)', () => {
    orgChart.addEmployee(employees[0]);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(2); //adam & unknown manager
    expect(nameHashmap.size).toBe(1); //only adam
    expect(employeeWithoutManager.size).toBe(1); //only adam's unknown manager
    expect(orgChart.findEmployeeByName('adam')).toHaveLength(1);
    expect(idHashmap.get(employees[2].id)?.totalDirectReports).toBe(1); //lancelot only have 1 direct report
  });

  it('should throw error because adding employee using id that already exist', () => {
    function addExistEmployee() {
      orgChart.addEmployee(employees[0]);
    }
    expect(addExistEmployee).toThrow(new UserVisibleError('User with ID 1 already exists'));
  });

  it('should have total 3 employee (adam, eve, & unknown manager)', () => {
    orgChart.addEmployee(employees[1]);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(3); //adam, eve & unknown manager
    expect(nameHashmap.size).toBe(2); //adam & eve
    expect(employeeWithoutManager.size).toBe(1); //only adam's unknown manager
    expect(orgChart.findEmployeeByName('eve')).toHaveLength(1);
    expect(idHashmap.get(employees[2].id)?.totalDirectReports).toBe(2); //lancelot only have 2 direct report
  });

  it('should successfully registering lancelot as adam & eve\'s manager', () => {
    orgChart.addEmployee(employees[2]);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(3);
    expect(nameHashmap.size).toBe(3); //adam, eve & lancelot
    expect(employeeWithoutManager.size).toBe(1); //only lancelot
    expect(orgChart.findEmployeeByName('lancelot')).toHaveLength(1);
    expect(idHashmap.get(employees[2].id)?.totalDirectReports).toBe(2); //lancelot still have 2 direct report
  });

  it('should successfully register an employee who will become the manager of Lancelot.', () => {
    orgChart.addEmployee(employees[3]);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(4);
    expect(nameHashmap.size).toBe(4); //adam, eve, lancelot, arthur
    expect(employeeWithoutManager.size).toBe(2); //lancelot and arthur
    expect(orgChart.findEmployeeByName('arthur')).toHaveLength(1);
    expect(idHashmap.get(employees[3].id)?.totalDirectReports).toBe(0); //arthur don't have any direct report
  });

  it('should assign arthur as lancelot\'s manager', () => {
    let editedLancelot = JSON.parse(JSON.stringify(employees[2]));
    editedLancelot.managerId = employees[3].id;
    orgChart.updateEmployee(editedLancelot);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(4);
    expect(nameHashmap.size).toBe(4); //adam, eve, lancelot, arthur
    expect(employeeWithoutManager.size).toBe(1); //arthur
    expect(idHashmap.get(employees[3].id)?.totalDirectReports).toBe(3); //adam, eve, lancelot
  });

  it('should add new employee as eve\'s direct report, and increase arthur\'s total direct report', () => {
    orgChart.addEmployee(employees[4]);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(5);
    expect(nameHashmap.size).toBe(4); //adam(2 person), eve, lancelot, arthur
    expect(employeeWithoutManager.size).toBe(1); //arthur
    expect(orgChart.findEmployeeByName('adam')).toHaveLength(2);
    expect(idHashmap.get(employees[3].id)?.totalDirectReports).toBe(4); //arthur's direct report increased
  });

  it('should throw an error because the organizational structural form a circle', () => {
    function createCircleOrganizationalStructure() {
      let editedArthur = JSON.parse(JSON.stringify(employees[3]));
      editedArthur.managerId = employees[4].id;
      orgChart.updateEmployee(editedArthur);
    }
    const { idHashmap } = getOrgChartValue();
    expect(createCircleOrganizationalStructure).toThrow(new UserVisibleError('organizational structure should not form a circle'));
    expect(idHashmap.get(employees[3].id)?.manager).toBe(null);
  });

  it('should reset the chart', () => {
    orgChart.resetChart();
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(0);
    expect(nameHashmap.size).toBe(0);
    expect(employeeWithoutManager.size).toBe(0);
    expect(orgChart.findEmployeeByName('adam')).toHaveLength(0);
  });

  it('should add all employee in the array', () => {
    orgChart.addEmployeesFromArray(employees);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(5);
    expect(nameHashmap.size).toBe(4); //adam(2 person), eve, lancelot, arthur
    expect(employeeWithoutManager.size).toBe(2); //lancelot & arthur
    expect(orgChart.findEmployeeByName('adam')).toHaveLength(2);
    expect(idHashmap.get(employees[2].id)?.totalDirectReports).toBe(3);
    expect(idHashmap.get(employees[3].id)?.totalDirectReports).toBe(0);
  });

  it('should change employee\'s manager and name', () => {
    let editedLancelot = JSON.parse(JSON.stringify(employees[2]));
    editedLancelot.managerId = employees[3].id;
    editedLancelot.name = "lynette";
    orgChart.updateEmployee(editedLancelot);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(5);
    expect(nameHashmap.size).toBe(4); //adam, eve, lynette, arthur
    expect(orgChart.findEmployeeByName('lynette')).toHaveLength(1);
    expect(employeeWithoutManager.size).toBe(1); //arthur
    expect(idHashmap.get(employees[2].id)?.totalDirectReports).toBe(3); //adam(2), eve
  });

  it('should promote an employee to upper manager', () => {
    let editedEve = JSON.parse(JSON.stringify(employees[1]));
    editedEve.managerId = employees[3].id;
    orgChart.updateEmployee(editedEve);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(5);
    expect(nameHashmap.size).toBe(4); //adam, eve, lynette, arthur
    expect(employeeWithoutManager.size).toBe(1); //arthur
    expect(idHashmap.get(employees[2].id)?.totalDirectReports).toBe(1); //only adam
    expect(idHashmap.get(employees[3].id)?.totalDirectReports).toBe(4); //everyone except arthur
    expect(idHashmap.get(employees[1].id)?.totalDirectReports).toBe(1); //only adam
  });

  it('should promote an employee to uppermost manager', () => {
    let editedEve = JSON.parse(JSON.stringify(employees[1]));
    editedEve.managerId = null;
    orgChart.updateEmployee(editedEve);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(5);
    expect(nameHashmap.size).toBe(4); //adam, eve, lynette, arthur
    expect(employeeWithoutManager.size).toBe(2); //arthur & eve
    expect(idHashmap.get(employees[2].id)?.totalDirectReports).toBe(1); //only adam
    expect(idHashmap.get(employees[3].id)?.totalDirectReports).toBe(2); //lynette and adam
    expect(idHashmap.get(employees[1].id)?.totalDirectReports).toBe(1); //only adam
  });

  it('should be able to remove employee that have manager and direct reports', () => {
    orgChart.deleteEmployee(employees[2].id);
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(4);
    expect(nameHashmap.size).toBe(3); //adam, eve, arthur
    expect(employeeWithoutManager.size).toBe(2); //arthur, eve
  });

  it('should add an employee who don\'t have a manager and direct report, and return a warning about it', () => {
    orgChart.addEmployee({
      id: 333,
      name: "diluc",
      managerId: null,
    });
    const warning = orgChart.checkChartAnomalies();
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();

    expect(idHashmap.size).toBe(5);
    expect(nameHashmap.size).toBe(4); //adam, eve, arthur, diluc
    expect(employeeWithoutManager.size).toBe(3); //arthur, eve, diluc
    expect(warning.length).toBeGreaterThanOrEqual(1);
  });

  it('should put existing employee into lowest tree, and count uppermost manager\'s direct and indirect reports', () => {
    orgChart.updateEmployee({ id: 333, name: 'diluc', managerId: employees[3].id });
    const { idHashmap, nameHashmap, employeeWithoutManager } = getOrgChartValue();
    const uppermostManager = idHashmap.get(employees[3].id);

    expect(idHashmap.size).toBe(5);
    expect(nameHashmap.size).toBe(4); //adam, eve, arthur, diluc
    expect(employeeWithoutManager.size).toBe(2); //arthur, eve
    expect(uppermostManager?.totalDirectReports).toBe(2); //adam & diluc
  });

});