import mongoose, { Document, Model } from 'mongoose';
import { DepartmentModel, BlackoutPeriodModel, BlackoutPeriodInterface, DepartmentInterface } from './models'; // Assuming models.ts is in the same directory
import { DepartmentValues, Employee, HolidayRule } from './../types/types';
import { Types } from 'mongoose';
import { employeeWorker } from './EmployeeWorker';
import { blackoutPeriodWorker } from './HolidayWorker';


class DepartmentWorker {

	async insertFromObject(holidayRulesByDepartment: { [key in DepartmentValues]: HolidayRule }) {
		const departmentDocs: DepartmentInterface[] = [];
		const holidayDocs: BlackoutPeriodInterface[] = [];

		let department: DepartmentValues;
  
		for (department in holidayRulesByDepartment) {
			const departmentRules = holidayRulesByDepartment[department] as HolidayRule;

			console.log(departmentRules.blackoutPeriods);

			let newHoliday = new BlackoutPeriodModel({
				_id: new Types.ObjectId(),
				start_date: departmentRules.blackoutPeriods[0].start,
				end_date: departmentRules.blackoutPeriods[0].end,
			  });
  
			let newDepartment = new DepartmentModel({
				_id: new Types.ObjectId(),
				name: department,
				max_consecutive_days: departmentRules.maxConsecutiveDays,
				blackout_periods: [newHoliday._id],
			})
  
		departmentDocs.push(newDepartment);
		holidayDocs.push(newHoliday);
		console.log(departmentRules);
		}
  
		try {
			await DepartmentModel.insertMany(departmentDocs);
			console.log('Departments populated successfully!');
		} catch (error) {
			console.error('Error populating departments:', error);
		}

		try {
			await BlackoutPeriodModel.insertMany(holidayDocs);
			console.log('Holidays populated successfully!');
		  } catch (error) {
			console.error('Error populating holidays:', error);
		  }
}

  async insertDepartment(data: DepartmentInterface): Promise<DepartmentInterface> {
	try {
	  const newDepartment = new DepartmentModel(data);
	  const savedDepartment = await newDepartment.save();
	  console.log(`Department ${data.name} saved successfully.`);
	  return savedDepartment;
	} catch (error) {
	  console.error('Error inserting department:', error);
	  throw error; // Re-throw the error for further handling
	}
  }

  async readAllDepartments(): Promise<DepartmentInterface[]> {
    try {
      const departments = await DepartmentModel.find();
      return departments as DepartmentInterface[]; // Ensure explicit typing
    } catch (error) {
      console.error('Error reading departments:', error);
      throw error; // Re-throw for further handling
    }
  }

  async insertManyDepartments(data: DepartmentInterface[]): Promise<DepartmentInterface[]> {
	try {
	  const savedDepartments = await DepartmentModel.insertMany(data);
	  console.log('Departments saved successfully.');
	  return savedDepartments;
	} catch (error) {
	  console.error('Error inserting departments:', error);
	  throw error; // Re-throw the error for further handling
	}
  }

  async getBlackoutPeriod(id: Types.ObjectId) {
	try {
		const Department = await this.getDepartment(id);
		const blackout_periods = await blackoutPeriodWorker.findBlackoutPeriod({_id: Department?.blackoutPeriods[0]});
		console.log(`Holiday is ${blackout_periods}`);
		const periods = blackout_periods.map((period: BlackoutPeriodInterface) => ({
			start_date: period.start_date,
			end_date: period.end_date,
		}));
		return periods;
	  } catch (error) {
		console.error('Error inserting departments:', error);
		throw error; // Re-throw the error for further handling
	  }
  }

  async findDepartmentByName(name: string): Promise<DepartmentInterface | null> {
    try {
      const department = await DepartmentModel.findOne({ name });
      return department;
    } catch (error) {
      console.error('Error finding department:', error);
      return null;
    }
  }

  async updateById(departmentId: Types.ObjectId, data: Partial<DepartmentInterface>): Promise<DepartmentInterface | null> {
	try {
	  const updatedDepartment = await DepartmentModel.findByIdAndUpdate(departmentId, data, { new: true });

	  if (updatedDepartment) {
		console.log(`Department ${updatedDepartment.name} updated successfully.`);
		return updatedDepartment as DepartmentInterface; // Ensure explicit typing
	  } else {
		console.warn(`Department with ID ${departmentId} not found.`);
		return null;
	  }
	} catch (error) {
	  console.error('Error updating department:', error);
	  throw error; // Re-throw the error for further handling
	}
  }

  async deleteDepartment(departmentId: Types.ObjectId): Promise<DepartmentInterface | null> {
	try {
	  const deletedDepartment = await DepartmentModel.findByIdAndDelete(departmentId);

	  if (deletedDepartment) {
		console.log(`Department ${deletedDepartment.name} deleted successfully.`);
		return deletedDepartment as DepartmentInterface; // Ensure explicit typing
	  } else {
		console.warn(`Department with ID ${departmentId} not found.`);
		return null;
	  }
	} catch (error) {
	  console.error('Error deleting department:', error);
	  throw error; // Re-throw the error for further handling
	}
  }

  async getDepartment(departmentId: Types.ObjectId): Promise<DepartmentInterface | null> {
	try {
	  const department = await DepartmentModel.findById(departmentId);
	  return department as DepartmentInterface;
	} catch (error) {
	  console.error('Error reading department:', error);
	  return null;
	}
  }
}

export const departmentWorker = new DepartmentWorker();
