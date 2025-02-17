const { getDb } = require("../db/connectDb");

const getSalaries = async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;
    const db = await getDb();
    
    try {
        const salaryQuery = `
            SELECT * FROM Salaries WHERE userId = $1
        `;
        const salaries = await db.query(salaryQuery, [userId]);

        const transactionQuery = `
            SELECT * FROM salaryTransactions WHERE userId = $1
        `;
        const transactions = await db.query(transactionQuery, [userId]);
        const userQuery = 'SELECT * FROM AllUsers WHERE id = $1';
        const userResult = await db.query(userQuery, [userId]);
        let userDetails = null;
        if (role === 'teacher') {
            const teacherQuery = `
                SELECT * FROM Teachers t WHERE userId = $1
            `;
            const teacherResult = await db.query(teacherQuery, [userId]);
            userDetails = teacherResult.rows[0];
        }
        else if (role === 'student'){
            const studentQuery = `
                SELECT * FROM Students s WHERE userId = $1
            `;
            const studentResult = await db.query(studentQuery, [userId]);
            userDetails = studentResult.rows[0];
        }
        else if(role === 'parent'){
            const parentQuery = `
                SELECT * FROM Parents p WHERE userId = $1
            `;
            const parentResult = await db.query(parentQuery, [userId]);
            userDetails = parentResult.rows[0]; 
        }

        return res.status(200).json({
            salaries: salaries.rows,
            transactions: transactions.rows,
            userDetails: userDetails,
            user: userResult.rows[0],

        });
    } catch (error) {
        console.error("Error fetching data", error);
        return res.status(500).json({ errorMsg: "Internal Server Error", error: error });
    }
};


const paySalary = async (req, res) => {
    const userId = req.user.userId;
    const { amount, salaryMonth, status, payslipUrl } = req.body; // Get details from request body

    if (!amount || !salaryMonth || !status) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const db = await getDb();

        const transactionId = `TXN${Date.now()}`;

        const transactionQuery = `
            INSERT INTO salary_transactions (userId, transaction_date, transaction_id, salary_month, amount, status, payslip_url)
            VALUES ($1, NOW(), $2, $3, $4, $5, $6)
        `;
        await db.query(transactionQuery, [userId, transactionId, salaryMonth, amount, status, payslipUrl]);

        
        return res.status(200).json({
            message: "Salary paid successfully",
            transactionId: transactionId,
            amount: amount,
            salaryMonth: salaryMonth,
            status: status
        });

    } catch (error) {
        console.error("Error processing salary payment", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = { getSalaries, paySalary };
