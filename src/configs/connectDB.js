const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "dfrh39c2pl2i7h", 
  "taqdqrosawkmci", 
  "506dd42823351245b8d7db523c52cb6c4ac9f85d31a838dd464a78e28e9ebbb0", 
{
  host: "ec2-34-227-135-211.compute-1.amazonaws.com",
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = connectDB;