import { Request, Response } from 'express';
import OrgChart from '../models/OrgChart';
import { IEmployee } from '../models/Employee';
import { UserVisibleError } from '../models/Error';

class OrgchartController {
  private orgchart : OrgChart;

  constructor() {
    this.orgchart = new OrgChart();
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
      const data = req.params.name;
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

  exportChart(req: Request, res: Response): void {
    try {
      const result = this.orgchart.exportChart();
      res.status(200).json(this.createSuccessResponseObject(result));
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  resetChart(req: Request, res: Response): void {
    try {
      const result = this.orgchart.resetChart();
      res.status(200).json(this.createSuccessResponseObject(result));
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  /**
   * Check input & normalize request data for add employee
   * @param data request data
   * @returns normalize request data
   */
  private createNewEmployeeInputObject(data:any):IEmployee {
    const id = data.id;
    const name = data.name;
    const managerId = Number(data.managerId) ?? null;
    if (!id || typeof id !== 'number') throw new UserVisibleError('Employee ID is required (id)');
    if (!name) throw new UserVisibleError('Employee name is required (name)');
    return {
      id: id,
      name: name,
      managerId: managerId,
    };
  }

  /**
   * Check input & normalize request data for update employee
   * @param data request data
   * @returns normalize request data
   */
  private createUpdateEmployeeInputObject(data:any):IEmployee {
    const id = data.id;
    let name = data.name || "";
    const managerId = data.managerId;
    if (!id || typeof id !== 'number') throw new UserVisibleError('Employee ID is required (id)');
    const result = {
      id: id,
      name: name,
      managerId: managerId,
    };
    if (!managerId) delete(result.managerId);
    return result;
  }

  /**
   * create an object structure that will be passed as response data
   * @param data data to return as response
   * @returns response data
   */
  private createSuccessResponseObject(data:any) {
    return {
      success: true,
      data: data,
      warning: this.orgchart.checkChartAnomalies(),
    };
  }

  /**
   * create an object structure that will be passed as response data when an error occurs
   * @param error error object when there is a problem
   * @param errorCode http error code that will be returned as response
   * @returns response data
   */
  private createErrorResponseObject(error: Error, errorCode: number) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
      },
    };
  }

  /**
   * function that will handle if there are some errors that occur
   * @param error error object when there is a problem
   * @param res response object
   */
  private handleError(error: any, res:Response) : void {
    console.error(error);
    let errorCode = 500;
    if (error instanceof UserVisibleError) {
      if (error.errorCode !== null) errorCode = error.errorCode;
      else errorCode = 400;
    }
    res.status(errorCode).json(this.createErrorResponseObject(error, errorCode));
  }
}

export default OrgchartController;
