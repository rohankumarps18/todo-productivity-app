# Smart To-Do Productivity App

A full-stack React Native To-Do application built as part of the **Modulus Seventeen React Native Assessment**.

The application combines standard task management with intelligent productivity features such as smart urgency scoring, deadline risk detection, Focus Mode, productivity insights, optimistic updates, and offline-friendly behavior.

---

## 🚀 Features

### 🔐 User Authentication
- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Persistent authentication state
- Secure logout

### ✅ Task Management
- Create tasks
- Edit tasks
- View task details
- Mark tasks as completed
- Delete tasks
- Track pending/completed status
- Task title and description
- Priority levels
- Date and time selection
- Deadline management

### 🧠 Smart Productivity Features

#### Smart Priority / Urgency Score
Tasks are ranked using a deterministic urgency calculation that considers:

- Task priority
- Time remaining
- Deadline proximity
- Overdue status

This allows the dashboard and Focus Mode to surface tasks that need attention.

#### Deadline Risk Detection

Tasks are categorized based on their deadline status:

- **Safe**
- **Due Soon**
- **At Risk**
- **Overdue**

#### Smart Task Ordering

Tasks can be organized using different sorting strategies:

- Smart urgency
- Deadline
- Priority
- Newest
- Completed status

#### 🎯 Focus Mode

Focus Mode recommends the task that should receive the user's attention based on the application's urgency and priority logic.

The recommendation also provides a rationale explaining why the task was selected.

#### 📊 Productivity Insights

The Insights screen provides productivity statistics including:

- Total tasks
- Completed tasks
- Pending tasks
- Overdue tasks
- Completion percentage
- High-priority completed tasks
- Tasks completed today
- Tasks created today
- Average completion time when sufficient data is available

The application provides an honest empty state when there is not enough completion history to calculate an average.

#### ⚡ Optimistic Updates

Task operations use optimistic UI behavior where appropriate.

If an API operation fails, the application can roll back the optimistic state and display an appropriate error.

#### 📡 Offline-Friendly Behavior

The application uses local persistence and graceful error handling to provide a better experience when network connectivity is temporarily unavailable.

---

## 🛠️ Technology Stack

### Mobile

- React Native CLI
- TypeScript
- React Navigation
- Zustand
- Axios
- AsyncStorage
- Jest
- ESLint

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Jest

### Development

- Android Studio
- Android Emulator
- Gradle
- Git / GitHub

---

## 📁 Project Structure

```text
todo-productivity-app/
│
├── mobile/
│   ├── android/
│   ├── ios/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── store/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   ├── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
