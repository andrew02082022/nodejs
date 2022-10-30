## Project Setup

In order to run the project, setup .env and set MONGO_URI variable equal to DB connection string.

In order to avoid port collisions, in the source code port value is 5000

.env
MONGO_URI=mongodb://127.0.0.1:27017/03-TASK_MANAGER?retryWrites=true&w=majority
PORT=3000