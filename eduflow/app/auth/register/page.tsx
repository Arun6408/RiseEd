'use client';
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
    // Define types for the states
    const [name, setName] = useState<string>("Arun");
    const [username, setUsername] = useState<string>("student22");
    const [email, setEmail] = useState<string>("student22@example.com");
    const [password, setPassword] = useState<string>("student123");
    const [password_confirmation, setPasswordConfirmation] = useState<string>("student123");
    const [role, setRole] = useState<string>("student");
    const [phone, setPhone] = useState<string>("9999999999");
    const [age, setAge] = useState<number>(15);
    const [salary, setSalary] = useState<number>(20000);
    const [otherMoneyBenefits, setOtherMoneyBenefits] = useState<number>(5000);
    const [department, setDepartment] = useState<string>("Mathematics");
    const [assignedClasses, setAssignedClasses] = useState<number[]>([1,2,3,4,5]);
    const [studentClass, setStudentClass] = useState<number>(2);
    const [scholarshipAmount, setScholarshipAmount] = useState<number>(5000);
    const [studentScore, setStudentScore] = useState<number>(90);
    const [error, setError] = useState<string[]>([]);

    const Router = useRouter();

    const roles = ["head_master", "teacher", "student"];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(password !== password_confirmation) {
            setPassword('');
            setPasswordConfirmation('');
            alert("Passwords do not match");
            return;
        }
        let body : any = { name, username, email, password, password_confirmation, role, phone, age };

        if(role === 'head_master' || role === 'teacher') {
            body['salary'] = salary;
            body['otherMoneyBenefits'] = otherMoneyBenefits;
            body['department'] = department;
            body['assignedClasses'] = assignedClasses;
        } else if(role === 'student') {
            body['class'] = studentClass;
            body['scholarshipAmount'] = scholarshipAmount;
            body['score'] = studentScore;
        }
        
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, body);
        const data = response.data;
        console.log(data);
        if(data.status !== "success") {
            setError(data.message);
        }
        

    };
  return (
    <div>
        <form className="" onSubmit={(e) => {handleSubmit(e)}}>
            <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="bg-transparent border-white border m-2 p-2"
            />
            <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="bg-transparent border-white border m-2 p-2"
            />
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="bg-transparent border-white border m-2 p-2"
            />
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="bg-transparent border-white border m-2 p-2"
            />
            <input
            type="password"
            value={password_confirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="password_confirmation"
            className="bg-transparent border-white border m-2 p-2"
            />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent border-white border m-2 p-2"
            >
                <option value="" disabled>
                Select role
                </option>
                {roles.map((roleOption) => (
                <option key={roleOption} value={roleOption} className="bg-transparent border border-white p-1"> 
                    {roleOption.replace("_", " ")}
                </option>
                ))}
            </select>
            <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="phone"
            className="bg-transparent border-white border m-2 p-2"
            />
            <input
            type="number"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            placeholder="age"
            className="bg-transparent border-white border m-2 p-2"
            />
            {
                (role === 'head_master' || role === 'teacher')&&(
                    <div>
                        <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(parseInt(e.target.value))}
                            placeholder="salary"
                            className="bg-transparent border-white border m-2 p-2"
                            />
                        
                        <input
                            type="number"
                            value={otherMoneyBenefits}
                            onChange={(e) => setOtherMoneyBenefits(parseInt(e.target.value))}
                            placeholder="other money benefits"
                            className="bg-transparent border-white border m-2 p-2"
                            />
                        
                        <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="department"
                            className="bg-transparent border-white border m-2 p-2"
                            />
                        
                        <input
                            type="text"
                            onChange={(e) => setAssignedClasses(e.target.value.split(",").map((item) => parseInt(item)))}
                            placeholder="assigned classes"
                            className="bg-transparent border-white border m-2 p-2"
                            />
                    </div>
                )
            }
            {
                role === 'student' && (
                    <div>
                        <input
                            type="number"
                            value={studentClass}
                            onChange={(e) => setStudentClass(parseInt(e.target.value))}
                            placeholder="student class"
                            className="bg-transparent border-white border m-2 p-2"
                            />
                        
                        <input
                            type="number"
                            value={scholarshipAmount}
                            onChange={(e) => setScholarshipAmount(parseInt(e.target.value))}
                            placeholder="scholarship amount"
                            className="bg-transparent border-white border m-2 p-2"
                            />
                                                    
                        <input
                            type="number"
                            value={studentScore}
                            onChange={(e) => setStudentScore(parseInt(e.target.value))}
                            placeholder="student score"
                            className="bg-transparent border-white border m-2 p-2"
                            />
                    </div>
                )
            }
            <button type="submit">Register</button>
        </form>
    </div>
  );
};

