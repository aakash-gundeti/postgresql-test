import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'testdb',
  password: 'password',
  port: 5432,
})

//uncomment this to create database and table
// pool.query('CREATE DATABASE testdb',(err, result) => {
//   if(err){
//     throw err
//   }
//   console.log("Database created successfully")
// })

// pool.query("CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(40), email VARCHAR(40), password VARCHAR(255))",(err, res) => {
//   if(err){
//     throw err
//   }
//   console.log('Table created successfully');
// });

// const user_experience_table = `CREATE TABLE user_experiences1(
//   id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(id),
//   title VARCHAR(255),
//   description TEXT,
//   start_date DATE,
//   end_date DATE
// )`
// pool.query(user_experience_table, (err, result) => {
//     if(err){
//       throw err
//     }
//     console.log('Table created successfully');
// });

// const user_qualification_table = `CREATE TABLE user_qualifications1 (
//   id SERIAL PRIMARY KEY,
//   user_id INT REFERENCES users(id),
//   title VARCHAR(255),
//   institution VARCHAR(255),
//   graduation_year INT
// );`;

// pool.query(user_qualification_table, (err, result) => {
//   if(err){
//     throw err
//   }
//   console.log('Table created successfully');
// });

const getUserFromCookies = (token) => {
  try{
    return jwt.verify(token, '0KILIFer2LvZj0xexnnsiQeZekoXMJ6j');
  }catch(err){
    throw err
  }
}

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword], (err, result) => {
    if (err) {
      throw err
    }
    console.log(result);
    res.status(201).json({ msg: "User added successfully" });
  })
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  //get user
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];
  console.log(user);

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const jwtToken = jwt.sign(
        { userId: user.id },
        '0KILIFer2LvZj0xexnnsiQeZekoXMJ6j',
        { expiresIn: '1h' }
      );
      return res
        .status(200)
        .cookie("jwtToken", jwtToken, { maxAge: 900000, httpOnly: false })
        .send("User logged in successfully");
    } else {
      return res.status(401).send("Invalid password please try again")
    }
  } else {
    return res.status(401).send("Invalid email or password")
  }
}

export const logout = (req, res) => {
  res.clearCookie('jwtToken');
  res.status(200).send("Logged out successfully");
}

export const resetPassword = async (req, res) => {
  //jwt token can be used after login
  const { token, newPassword } = req.body;
  try {
    const decodedToken = getUserFromCookies(token);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decodedToken.userId]);

    res.status(200).send('Password reset successfully');
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unauthorized");
  }
}

export const getUsers = (req, res) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (err, result) => {
    if (err) {
      throw err
    }
    res.status(200).json(result.rows);
  })
}

export const getUserProfile = (req, res) => {
  const id = parseInt(req.params.id);
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, results) => {
    if(err){
      throw err
    }
    res.status(200).json(results.rows);
  })
}

export const updateProfile = async (req, res) => {
  const { userId } = getUserFromCookies(req.cookies.jwtToken);
  const { name, email } = req.body;

  const { rows } = await pool.query("SELECT * from users WHERE id = $1",[userId])

  console.log(rows[0]);
  const user = rows[0];
  if(!user){
    return res.status(401).send("User not found");
  }

  pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3",[name, email, userId],(err, result)=>{
    if(err){
      throw err
    }
    console.log(result);
    res.status(201).json({ msg: "User updated successfully" });
  })
  console.log(user);
}

export const addExperience = (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  const { userId } = getUserFromCookies(req.cookies.jwtToken);

  pool.query("INSERT INTO user_experiences (user_id, title, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5)",[userId, title, description, start_date, end_date],(err, result) => {
    if(err){
      throw err
    }
    res.status(201).send("User Experience added successfully");
  })
}

export const updateExperience = (req, res) => {
  const { title, description, start_date, end_date } = req.body;
  const id = req.params.id;

  pool.query("UPDATE  user_experiences SET title = $1, description = $2, start_date = $3, end_date= $4 WHERE id = $5", [ title, description, start_date, end_date, id], (err, result) => {
    if (err) {
      throw err
    }
    res.status(201).send("User Experience updated successfully");
  })
}

export const removeExperience = (req, res) => {
  const id = req.params.id;

  pool.query("DELETE FROM user_experiences WHERE id = $1", [id], (err, result) => {
    if (err) {
      throw err
    }
    res.status(201).send("User Experience deleted successfully");
  })
}

export const addQualification = (req, res) => {
  const { title, institution, graduation_year } = req.body;
  const { userId } = getUserFromCookies(req.cookies.jwtToken);

  pool.query("INSERT INTO user_qualifications (user_id, title, institution, graduation_year) VALUES ($1, $2, $3, $4)", [userId, title, institution, graduation_year], (err, result) => {
    if (err) {
      throw err
    }
    res.status(201).send("User Qualifications added successfully");
  })
}

export const updateQualification = (req, res) => {
  const { title, institution, graduation_year } = req.body;
  const id = req.params.id;

  pool.query("UPDATE  user_qualifications SET title = $1, institution = $2, graduation_year = $3 WHERE id = $4", [title, institution, graduation_year, id], (err, result) => {
    if (err) {
      throw err
    }
    res.status(201).send("User Qualification updated successfully");
  })
}

export const removeQualification = (req, res) => {
  const id = req.params.id;

  pool.query("DELETE FROM user_qualifications WHERE id = $1", [id], (err, result) => {
    if (err) {
      throw err
    }
    res.status(201).send("User Qualification deleted successfully");
  })
}