import { employeeWorker } from "./EmployeeWorker";
import { blackoutPeriodWorker } from "./HolidayWorker";
import { departmentWorker } from "./DepartmentWorker";
import { requestWorker } from "./RequestWorker";
import { Employee, DepartmentSQL, HolidayRequest, EmployeeCredentials } from "../types/types";
import { DBConnector, DatabaseType } from "./db";
import { EmployeeInterface, BlackoutPeriodInterface, EmployeeModel, DepartmentInterface, RequestInterface, CredentialsInterface } from "./models";
import { Types } from "mongoose";
import { holidayRulesByDepartment } from "../../data/dataStore";
import { employeeController } from "../controllers/employee.controller"
import { employeeCredentialController } from "../controllers/employee.credential.controller"
import { departmentController } from "../controllers/department.controller";
import { blackoutPeriodsController } from "../controllers/blackoutperiods.controller";
import { requestController } from "../controllers/request.controller";
import { uri } from "./db";
import { AppDataSource } from "../database";



export class DBWorker {

    constructor(private dbConnector: DBConnector) {}

    async getEmployeeIdByName(employeeName:string): Promise <Types.ObjectId | number | undefined> {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return (await employeeWorker.getByName(employeeName))?._id;
            } else {
                return await employeeController.getEmployeeIdByName(employeeName);
            }
        } catch (error) {
            console.error('Error retrieving employees by name:', error);
        }
    }

    async getEmployeeByEmail(email: string): Promise<CredentialsInterface | EmployeeCredentials | null> {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return await employeeWorker.getByEmail(email);
            } else {
                return await employeeCredentialController.getByEmail(email);
            }
        } catch (error) {
            throw error;
        }
    }


    async getEmployeeByJwtPayLoad(jwtPayLoad: any): Promise<Employee | null> {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                //return await employeeWorker.getByEmail(email);
                console.log("Need implement for MongoDB");
                return null;
            } else {
                return await employeeController.getEmployeeByJwt(jwtPayLoad);
            }
        } catch (error) {
            throw error;
        }
    }


    async save2FACode(email: string, code:string) {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                //return await employeeWorker.getByEmail(email);
                console.log("Need implement for MongoDB");
                return null;
            } else {
                return await employeeCredentialController.saveCode(email, code);
            }
        } catch (error) {
            throw error;
        }
    }


    async verify2FACode(employeeId: string | Types.ObjectId, code:string){
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                //return await employeeWorker.getByEmail(email);
                console.log("Need implement for MongoDB");
                return null;
            } else {
                return await employeeCredentialController.verifyCode(employeeId as string, code);
            }
        } catch (error) {
            throw error;
        }
    }


    async getEmployeeByName(name: string): Promise<EmployeeInterface | Employee | null> {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return await employeeWorker.getByName(name);
            } else {
                return await employeeController.getEmployee(name);
            }
        } catch (error) {
            throw error;
        }
    }

    async getBlackoutPeriods(id: Types.ObjectId | number | null | undefined) {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return await departmentWorker.getBlackoutPeriod(id as Types.ObjectId);
            } else {
                return await blackoutPeriodsController.getBlackoutPeriods(id as number);
            }
        } catch (error) {
            console.error(`Error retrieving blackoutPeriods for department with id: ${id}:`, error);
    }}



    async getRequests() {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return await requestWorker.findAllRequests();
            } else {
                return await requestController.getAllRequests();
            }
        } catch (error) {
            console.error(`Error retrieving all requests:`, error);
            throw error;
        }

    }

    async getHolidayRequestsByEmployeeId(id: any) {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return (await requestWorker.findRequestsByEmployeeId(id as Types.ObjectId)).filter(
                    (request: RequestInterface) => request.status == 'pending'
                );
            } else {
                return (await requestController.getEmployeeRequests(id as number)).filter(
                    (request: HolidayRequest) => request.status == 'pending')
            }
        } catch (error) {
            console.error(`Error retrieving holidays for employee with id: ${id}:`, error);
            throw error;
        }
    }

    async getRemainingHolidays(employee: EmployeeInterface | Employee): Promise<number>{
        if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
            let emp = employee as EmployeeInterface;
            return emp.remaining_holidays;
        } else {
            let emp = employee as Employee;
            return emp.remaining_holidays;
        }
    }

    async updateRequest(requestId: Types.ObjectId | string, newData: Partial<RequestInterface | HolidayRequest>): Promise<RequestInterface | HolidayRequest | undefined | null> {
        if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
            return await requestWorker.updateRequestById(requestId as Types.ObjectId, newData as Partial<RequestInterface>);
        } else {
            return await requestController.updateHolidayRequest(requestId as string, newData as Partial<HolidayRequest>);
        }
    }


    async createRequest(newRequest: RequestInterface | HolidayRequest) {
        if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
            return await requestWorker.createRequest(newRequest as RequestInterface);
        } else {
            await requestController.createRequest(newRequest as HolidayRequest);
        }
    }

    async getEmployeeById(id: Types.ObjectId | number | undefined): Promise<EmployeeInterface | null | Employee> {
        if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
            return await employeeWorker.getById(id as Types.ObjectId);
        } else {
            return await employeeController.getEmployeeById(id as number);
        }
    }


    async updateEmployeeById(id: Types.ObjectId, newData: Partial<EmployeeInterface>): Promise<EmployeeInterface | null> {
        if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
            return await employeeWorker.updateById(id, newData);
        } else {
            throw new Error('Employee data update currently only supported in MongoDB');
        }
    }

    async updateDepartmentById(id: Types.ObjectId, newData: Partial<DepartmentInterface>): Promise<DepartmentInterface | null> {
        if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
            return await departmentWorker.updateById(id, newData);
        } else {
            throw new Error('Department data update currently only supported in MongoDB');
        }
    }

    async updateBlackoutPeriodById(id: Types.ObjectId, newData: Partial<BlackoutPeriodInterface>) {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                const holidayId = new Types.ObjectId(id);
                return await blackoutPeriodWorker.updateById(holidayId, newData);
            } else {
                throw new Error('Holiday data update currently only supported in MongoDB');
            }
        } catch (error) {
            console.error('Error updating holiday:', error);
            throw error; // Re-throw for further handling
        }
    }

    async getRequestById(id: Types.ObjectId | string): Promise<RequestInterface| HolidayRequest | null> {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return await requestWorker.getRequestById(id as Types.ObjectId);
            } else {
                return await requestController.getRequest(id as string);
            }
        } catch (error) {
            console.error('Error retrieving request:', error);
            throw error;
        }
    }

    async getDepartment(employee: EmployeeInterface | Employee): Promise<Partial<DepartmentInterface> | null> {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return await departmentWorker.getDepartment((employee as EmployeeInterface).department);
            } else {
                return await departmentController.getDepartmentById((employee as Employee).department_id);
            }
        } catch (error) {
            console.error('Error retrieving request:', error);
            throw error; 
        }
    }

    async getDepartmentById(departmentId: Types.ObjectId | number): Promise < DepartmentInterface | DepartmentSQL | null> {
       try {
           if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
               return await departmentWorker.getDepartment(departmentId as Types.ObjectId);
           } else {
               return await departmentController.getDepartmentById(departmentId as number);
           }
       } catch (error) {
           console.error('Error reading departments:', error);
           throw error;
       }
    }

    async getDepartmentIdByName(departmentName:string | undefined){
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                
                return await departmentWorker.findDepartmentByName(departmentName);
            } else {
                return await departmentController.getDepartmentId(departmentName);
                
            }
        } catch (error) {
            console.error('Error reading departments:', error);
            throw error; // Re-throw for further handling
        }
    }

    async getBlackoutPeriodsForDepartment(departmentId:any) {
        try {
            if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
                return [];
            } else {
                return await blackoutPeriodsController.getBlackoutPeriods(departmentId);
            }
        } catch (error) {
            console.error('Error reading departments:', error);
            throw error;
        }
    }

    // async getEmployeesFromObject() {
    //     const employees = getEmployees();
    //     for (let employee of employees) {
    //         const departmentId = await dbWorker.getDepartmentIdByName(employee.department);
    //         const departmentObjectId = departmentId ? departmentId._id : new Types.ObjectId();

    //         const emp = {
    //             _id: new Types.ObjectId(),
    //             name: employee.name,
    //             department: departmentObjectId,
    //             country: employee.country,
    //             remaining_holidays: employee.remaining_holidays,
    //         }
            
    //         await employeeWorker.insertEmployee(emp as EmployeeInterface);
            
    //         const requests = getRequests(employee.id);
            
    //         for (let request of requests) {
            
    //             await requestWorker.createRequest({
    //                 _id: new Types.ObjectId(),
    //                 employee_id: emp._id,
    //                 start_date: request.start_date,
    //                 end_date: request.end_date,
    //                 status: request.status,
    //             });
    //         }
    //     }
    // }

    //async getHolidayRequestsByEmployee(employeeId: Types.ObjectId | number | undefined) {
    //    if (this.dbConnector.currentDatabaseType === DatabaseType.PostgreSQL) {
    //        return await requestWorker.findRequestsByEmployeeId(employeeId as Types.ObjectId);
    //    } else {
    //        return await requestController.getEmployeeRequests(employeeId as number);
    //      // throw new Error('Holiday data retrieval currently only supported in PostgreSQL');
    //    }
    //}

    //async copyDataFromJson() {
    //    await dbWorker.getDepartmentsFromObject();
    //    //await dbWorker.getEmployeesFromObject();
    //}

    
    async getHolidayRequestsByEmployee(employeeId: Types.ObjectId | number | undefined) {
        if (this.dbConnector.currentDatabaseType === DatabaseType.PostgreSQL) {
            return await requestWorker.findRequestsByEmployeeId(employeeId as Types.ObjectId);
        } else {
            return await requestController.getEmployeeRequests(employeeId as number);
        }
    }

    async getDepartmentsFromObject() {
       departmentWorker.insertFromObject(holidayRulesByDepartment);
    }

	async getEmployees(): Promise<EmployeeInterface[] | Employee[]> {
        if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
            try {
                const employees = await EmployeeModel.find();
                return employees;
              } catch (error) {
                console.error('Error reading employees:', error);
                throw error;
              }
        } else {
            return await employeeController.getEmployees();
        }
	}

    async deleteRequestById(requestId: Types.ObjectId | number){
       try {
           if (this.dbConnector.currentDatabaseType === DatabaseType.MongoDB) {
               return await requestWorker.deleteRequestById(requestId as Types.ObjectId);
           } else {
               return await requestController.deleteRequest(requestId as number);
           }
       } catch (error) {
           console.error('Error updating holiday:', error);
           throw error;
       }
    }

}

const dbConnectorInstance = DBConnector.getInstance(uri, AppDataSource);
export const dbWorker = new DBWorker(dbConnectorInstance);