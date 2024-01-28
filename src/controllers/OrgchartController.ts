import { Request, Response } from 'express';
import OrgChart from '../models/OrgChart';
import { IEmployee } from '../models/Employee';
import { UserVisibleError } from '../models/Error';

class OrgchartController {
  private orgchart : OrgChart;

  constructor() {
    this.orgchart = new OrgChart();
  }

  private createNewEmployeeInput(data:Request):IEmployee {
    const id = data.body.id;
    const name = data.body.name;
    const manager = Number(data.body.manager) ?? null;
    if (!id || typeof id !== 'number') throw new UserVisibleError('Employee ID is required (id)');
    if (!name) throw new UserVisibleError('Employee name is required (name)');
    return {
      id: id,
      name: name,
      manager: manager,
    };
  }

  private createSuccessResponse(data:any) {
    return {
      success: true,
      data: data,
    };
  }

  private createErrorResponse(error: Error, errorCode: number) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
      },
    };
  }

  addEmployee(req: Request, res: Response): void {
    try {
      const value = this.createNewEmployeeInput(req);
      this.orgchart.addEmployee(value);
      res.status(200);
      res.json(this.createSuccessResponse(value));
    } catch (error: any) {
      let errorCode = 500;
      if (error instanceof UserVisibleError) {
        errorCode = 400;
      }
      res.status(errorCode);
      res.json(this.createErrorResponse(error, errorCode));
    }
  }
}

export default OrgchartController;
