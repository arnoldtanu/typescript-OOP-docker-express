import { Request, Response } from 'express';
import OrgChart from '../models/OrgChart';
import { IEmployee } from '../models/Employee';
import { UserVisibleError } from '../models/Error';

class OrgchartController {
  private orgchart : OrgChart;

  constructor() {
    this.orgchart = new OrgChart();
  }

  private createNewEmployeeInputObject(data:any):IEmployee {
    const id = data.id;
    const name = data.name;
    const manager = Number(data.manager) ?? null;
    if (!id || typeof id !== 'number') throw new UserVisibleError('Employee ID is required (id)');
    if (!name) throw new UserVisibleError('Employee name is required (name)');
    return {
      id: id,
      name: name,
      manager: manager,
    };
  }

  private createUpdateEmployeeInputObject(data:any):IEmployee {
    const id = data.id;
    let name = data.name || "";
    const manager = data.manager;
    if (!id || typeof id !== 'number') throw new UserVisibleError('Employee ID is required (id)');
    const result = {
      id: id,
      name: name,
      manager: manager,
    };
    if (!manager) delete(result.manager);
    return result;
  }

  private createSuccessResponseObject(data:any) {
    return {
      success: true,
      data: data,
    };
  }

  private createErrorResponseObject(error: Error, errorCode: number) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
      },
    };
  }

  private handleError(error: any, res:Response) : void {
    console.error(error);
    let errorCode = 500;
    if (error instanceof UserVisibleError) {
      if (error.errorCode !== null) errorCode = error.errorCode;
      else errorCode = 400;
    }
    res.status(errorCode).json(this.createErrorResponseObject(error, errorCode));
  }

  addEmployees(req: Request, res: Response): void {
    try {
      const datas = req.body;
      if (Array.isArray(datas)) {
        datas.map((data:any) => {
          return this.createNewEmployeeInputObject(data);
        });
        this.orgchart.addEmployeesFromArray(datas);
      } else {
        this.orgchart.addEmployee(this.createNewEmployeeInputObject(datas));
      }
      res.status(200).json(this.createSuccessResponseObject(datas));
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  findEmployees(req: Request, res: Response): void {
    try {
      const data = req.params.id;
      if (!data || !(typeof data === 'string') || data.length < 0) throw new UserVisibleError('The name of the employee to be searched is required (name)');
      const result = this.orgchart.findEmployeeByName(data);
      if (result.length > 0) {
        res.status(200).json(this.createSuccessResponseObject(result));
      } else {
        throw new UserVisibleError(`Cannot find employee with name '${data}'`, 404);
      }
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  updateEmployee(req: Request, res: Response): void {
    try {
      const data = this.createUpdateEmployeeInputObject(req.body);
      this.orgchart.updateEmployee(data);
      res.status(200).json(this.createSuccessResponseObject(data));
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  deleteEmployee(req: Request, res: Response): void {
    try {
      const data = req.body.id;
      if (!data || typeof data !== 'number') throw new UserVisibleError('Employee ID is required (id)');
      this.orgchart.deleteEmployee(data);
      res.status(200).json(this.createSuccessResponseObject(data));
    } catch (error: any) {
      this.handleError(error, res);
    }
  }
}

export default OrgchartController;
