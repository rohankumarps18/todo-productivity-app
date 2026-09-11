export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  AddTask: undefined;
  EditTask: { taskId: string };
  TaskDetails: { taskId: string };
  FocusMode: undefined;
  Insights: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};
