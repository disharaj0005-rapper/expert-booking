# Windows Setup Guide: Expert Session Booking System

Follow these steps to get the project running locally on your Windows machine.

## 1. Prerequisites
Ensure you have the following installed on your system:

*   **Node.js** (v18 or higher): [Download here](https://nodejs.org/)
*   **MongoDB Atlas** (free cloud database): [Sign up here](https://www.mongodb.com/atlas)
*   **Git** (optional, for cloning): [Download here](https://git-scm.com/)

---

## 2. Database Setup (MongoDB Atlas)
1.  **Create a free Atlas account** at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2.  **Create a Cluster**: Choose the free tier (M0 Sandbox). Select a region closest to you.
3.  **Create a Database User**: Go to **Database Access** → **Add New Database User**. Set a username and password (save these for the `.env` file).
4.  **Whitelist your IP**: Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (or add your current IP).
5.  **Get your connection string**: Go to **Databases** → **Connect** → **Drivers** → Copy the connection string. It looks like:
    ```
    mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/expert-booking?retryWrites=true&w=majority
    ```
6.  Replace `<username>`, `<password>`, and `<cluster-name>` with your actual values.

---

## 3. Backend Setup
1.  Open **PowerShell** or **Command Prompt** and navigate to the `backend` folder:
    ```powershell
    cd path\to\expert-booking\backend
    ```
2.  **Install Dependencies**:
    ```powershell
    npm install
    ```
3.  **Environment Configuration**:
    Create a file named `.env` in the `backend` directory and add the following:
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/expert-booking?retryWrites=true&w=majority
    JWT_SECRET=your_secret_key_here
    CLIENT_URL=http://localhost:5173
    ```
    > **Important:** Replace `<username>`, `<password>`, and `<cluster-name>` with your MongoDB Atlas credentials from Step 2.
4.  **Seed Data (Optional)**: To populate the database with initial experts and users:
    ```powershell
    npm run seed
    ```
5.  **Start the Server**:
    ```powershell
    npm run dev
    ```
    *The backend will now be running at `http://localhost:5000`.*

---

## 4. Frontend Setup
1.  Open a **new** terminal window and navigate to the `frontend` folder:
    ```powershell
    cd path\to\expert-booking\frontend
    ```
2.  **Install Dependencies**:
    ```powershell
    npm install
    ```
3.  **Environment Configuration**:
    Create a file named `.env` in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:5000
    ```
4.  **Start the Application**:
    ```powershell
    npm run dev
    ```
    *The frontend will now be running at `http://localhost:5173`.*

---

## 5. Troubleshooting (Windows Specific)

### MongoDB Atlas Connection Error
If you see `MongoServerSelectionError` or `ENOTFOUND`:
*   Verify your connection string in `.env` is correct.
*   Check that your IP is whitelisted in **Atlas → Network Access**.
*   Make sure your database user credentials are correct in **Atlas → Database Access**.
*   Ensure your firewall/VPN is not blocking outbound connections on port 27017.

### Execution Policy Error (PowerShell)
If you get an error saying `nodemon.ps1 cannot be loaded because running scripts is disabled`:
*   Run PowerShell as **Administrator**.
*   Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine`
*   Type `Y` and press Enter.

### Port Already in Use
If port 5000 or 5173 is busy:
1.  Run: `netstat -ano | findstr :5000`
2.  Note the PID (the last number in the row).
3.  Run: `taskkill /PID <PID_NUMBER> /F`

---

## Summary of URLs
*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **Backend API**: [http://localhost:5000](http://localhost:5000)
*   **MongoDB Atlas**: [https://cloud.mongodb.com](https://cloud.mongodb.com)
