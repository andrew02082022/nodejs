const express = require('express');
const router = express.Router();
const {getAllEmployees, createNewEployee, updateEmployee, deleteEmployee, getEmployee} = require("../../controllers/employeesController");

router.route('/')
    .get(getAllEmployees)
    .post(createNewEployee)
    .put(updateEmployee)
    .delete(deleteEmployee);

router.route('/:id')
    .get(getEmployee);

module.exports = router;