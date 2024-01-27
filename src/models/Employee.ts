export type TID = number;
export type TName = string;
export type TManager = Employee | null;
export type TDirectReports = Employee[];
export type TTotalDirectReports = number;

export type TInputId = number | null;
export type TInputManager = number | null;
export interface IEmployee {
  id : number;
  name : string;
  manager? : TInputManager;
  directReports? : TDirectReports;
  totalDirectReports? : TTotalDirectReports;
}

class Employee {
  id : number;
  name : string;
  manager : TManager;
  directReports : TDirectReports;
  totalDirectReports : number;

  constructor(input: IEmployee) {
    this.id = input.id;
    this.name = input.name;
    this.manager = null;
    this.directReports = [];
    this.totalDirectReports = 0;
  }
}

export default Employee;