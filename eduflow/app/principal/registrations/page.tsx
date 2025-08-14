"use client";

import React, { useState } from "react";
import PrincipalLayout from "../PrincipalLayout";
import axios from "axios";
import { setToken } from "@/utils/util";
import { RegisterUser } from "@/types";

const RegisterPage = () => {
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string[]>([]);
  const [formData, setFormData] = useState<RegisterUser>({
    name: "",
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    role: "",
    phone: null,
    age:  null,

    subject:  "",
    assignedClasses: [],
    basicSalary:  null,
    rentAllowance:  null,
    foodAllowance:  null,
    travelAllowance:  null,
    otherAllowance:  null,

    taxDeduction:  null,
    providentFund:  null,
    otherDeductions:  null,

    class:  null,
    scholarshipAmount:  null,
    score:  null,

    parentName:  "",
    parentUsername: "",
    parentPassword: "",
    parentPasswordConfirmation: "",
    parentAge: null,
    parentPhoneNumber: null,
    parentEmail: "",
    totalFeeAmount: null,
    feePaid: null,
  });

  const roles = ["headMaster", "teacher", "student"];
  const subjects = ["English", "Science", "Social Studies", "Mathematics", "Hindi"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? Number(value) || null : value,
    }));
  };

  const clearForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      role: "",
      phone: null,
      age:  null,
  
      subject:  "",
      assignedClasses: [],
      basicSalary:  null,
      rentAllowance:  null,
      foodAllowance:  null,
      travelAllowance:  null,
      otherAllowance:  null,
  
      taxDeduction:  null,
      providentFund:  null,
      otherDeductions:  null,
  
      class:  null,
      scholarshipAmount:  null,
      score:  null,
  
      parentName:  "",
      parentUsername: "",
      parentPassword: "",
      parentPasswordConfirmation: "",
      parentAge: null,
      parentPhoneNumber: null,
      parentEmail: "",
      totalFeeAmount: null,
      feePaid: null,
    });
  };
  
  

  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.name ||
        !formData.username ||
        !formData.email ||
        !formData.password ||
        !formData.passwordConfirmation||
        !formData.phone ||
        !formData.age
      ) {
        alert("Please fill all required fields");
        return false;
      }
      if (formData.password !== formData.passwordConfirmation) {
        alert("Passwords do not match");
        return false;
      }
    }
    if (step === 2 && !formData.role) {
      alert("Please select a role");
      if (formData.role === "teacher" || formData.role === "headMaster") {
        if (
          !formData.subject ||
          !formData.assignedClasses.length ||
          !formData.basicSalary ||
          !formData.rentAllowance ||
          !formData.foodAllowance ||
          !formData.travelAllowance ||
          !formData.otherAllowance ||
          !formData.taxDeduction ||
          !formData.providentFund ||
          !formData.otherDeductions
        ) {
          alert("Please Fill All Required Fields");
        }
      }

      if(formData.role === "student"){
        if(
         !formData.class ||
         !formData.scholarshipAmount ||
         !formData.score || 
         !formData.parentName ||
         !formData.parentUsername ||
         !formData.parentPassword ||
         !formData.parentPasswordConfirmation ||
         !formData.parentAge ||
         !formData.parentPhoneNumber ||
         !formData.parentEmail ||
         !formData.totalFeeAmount
        ){
          alert("Please Fill All Required Fields");
        }
      }

      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => 
        typeof value === "string" ? [key, value.trim()] : [key, value]
      )
    );
  
    try {
      setToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        trimmedData
      );
      console.log(response);
      const data = response.data;
      alert(data.message);
      if (data.status !== "success") {
        setError(data.message);
        //scroll top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      else clearForm();
    } catch (err:any) {
      console.log(err);
      setError([err.response.data.message]);
    }
  };
  

  return (
    <PrincipalLayout activeLink="/principal/registrations">
      <div className="flex justify-start min-h-full w-full bg-gradient-to-br from-teal-600 to-teal-900 px-4">
        <form
          onSubmit={handleSubmit}
          className=" md:p-8 rounded-2xl w-full md:w-3/4"
        >
          <h2 className="text-white text-3xl font-bold mb-6">Register</h2>
          {error.length > 0 && (
            <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
              {error.join(", ")}
            </div>
          )}

          {/* Step 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                <label className="label">
                  Full Name:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                <label className="label">
                  Username:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                <label className="label">
                  Email:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                <label className="label">
                  Password:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                <label className="label">
                  Confirm Password:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <input
                  type="password"
                  name="passwordConfirmation"
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                <label className="label">
                  Age:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || 0}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                <label className="label">
                  Phone Number:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone || 0}
                  onChange={handleChange}
                  className="input-field w-full"
                />
              </div>

              <div className="w-full flex justify-end mt-8">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-teal-500 hover:bg-teal-400 transition rounded-lg shadow-lg font-semibold text-white border border-teal-300"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Role & Salary Details */}
          {step === 2 && (
            <div className="space-y-1">
              <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                <label className="label">
                  Select Role:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="" disabled className="text-white bg-teal-500 hover:bg-teal-400">
                    Select Role
                  </option>
                  {roles.map((roleOption) => (
                    <option
                      key={roleOption}
                      value={roleOption}
                      className="text-white bg-teal-500 hover:bg-teal-400"
                    >
                      {roleOption}
                    </option>
                  ))}
                </select>
              </div>

              {["headMaster", "teacher"].includes(formData.role) ? (
                <>
                <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                <label className="label">
                  Select Subject:
                  <span className="text-red-600 font-bold text-xl">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field w-full"
                >
                  <option value="" disabled className="text-white bg-teal-500 hover:bg-teal-400">
                    Select Subject
                  </option>
                  {subjects.map((subject) => (
                    <option
                      key={subject}
                      value={subject}
                      className="text-white bg-teal-500 hover:bg-teal-400"
                    >
                      {subject}
                    </option>
                  ))}
                </select>
                </div>
                  <h3 className="text-white text-lg font-semibold mt-4">
                    Salary Details
                  </h3>
                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Basic Salary:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Rent Allowance:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="rentAllowance"
                      value={formData.rentAllowance || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Food Allowance:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="foodAllowance"
                      value={formData.foodAllowance || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Travel Allowance:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="travelAllowance"
                      value={formData.travelAllowance || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Other Allowance:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="otherAllowance"
                      value={formData.otherAllowance || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <h3 className="text-white text-2xl font-semibold mt-12">
                    Deductions
                  </h3>
                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Tax Deduction:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="taxDeduction"
                      value={formData.taxDeduction || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Provident Fund:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="providentFund"
                      value={formData.providentFund || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Other Deductions:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="otherDeductions"
                      value={formData.otherDeductions || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>
                </>
              ) : formData.role === "student" ? (
                <>
                  <h2 className="text-white text-2xl font-semibold mt-6">
                    Student Details
                  </h2>
                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Class:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="class"
                      value={formData.class || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Scholarship Amount:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="scholarshipAmount"
                      value={formData.scholarshipAmount || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>

                  <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                    <label className="label">
                      Score:
                      <span className="text-red-600 font-bold text-xl">*</span>
                    </label>
                    <input
                      type="number"
                      name="score"
                      value={formData.score || ""}
                      onChange={handleChange}
                      className="input-field w-full"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Parent Full Name:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>

                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Parent Username:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="parentUsername"
                        value={formData.parentUsername}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>

                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Parent Email:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>

                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Phone Number:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="number"
                        name="parentPhoneNumber"
                        value={formData.parentPhoneNumber || 0}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>

                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Parent Age:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="number"
                        name="parentAge"
                        value={formData.parentAge || 0}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>

                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Parent Password:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="password"
                        name="parentPassword"
                        value={formData.parentPassword}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>

                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start text-sm md:items-center">
                      <label className="label">
                        Parent Confirm Password:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="password"
                        name="parentPasswordConfirmation"
                        value={formData.parentPasswordConfirmation}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>
                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Total Fee:
                        <span className="text-red-600 font-bold text-xl">
                          *
                        </span>
                      </label>
                      <input
                        type="decimal"
                        name="totalFeeAmount"
                        value={formData.totalFeeAmount || 0}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>
                    <div className="w-full flex flex-col md:justify-between md:flex-row items-start md:items-center">
                      <label className="label">
                        Fee Paid (If any):
                      </label>
                      <input
                        type="number"
                        name="feePaid"
                        value={formData.feePaid || 0}
                        onChange={handleChange}
                        className="input-field w-full"
                      />
                    </div>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 transition rounded-lg shadow-md text-teal-200 font-medium border border-teal-500"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-teal-500 hover:bg-teal-400 transition rounded-lg shadow-lg font-semibold text-white border border-teal-300"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6 text-white p-6 bg-teal-900 rounded-xl shadow-2xl border border-teal-700">
              <h3 className="text-2xl font-bold text-teal-200 border-b border-teal-700 pb-3 text-center">
                Review Your Details
              </h3>

              <div className="bg-teal-800 p-6 rounded-lg shadow-md space-y-4">
                {Object.keys(formData).map((key) => (
                  <div
                    key={key}
                    className="flex justify-between items-center bg-teal-700/50 p-3 rounded-lg"
                  >
                    <span className="font-medium text-teal-300">
                      {key.replace(/([A-Z])/g, " $1")}:
                    </span>
                    <span className="text-teal-100 font-semibold">
                      {formData[key as keyof typeof formData] || "N/A"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-600 transition rounded-lg shadow-md text-teal-200 font-medium border border-teal-500"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-500 hover:bg-teal-400 transition rounded-lg shadow-lg font-semibold text-white border border-teal-300"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </PrincipalLayout>
  );
};

export default RegisterPage;
