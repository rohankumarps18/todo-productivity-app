import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";
import AddTaskScreen from "../screens/AddTaskScreen";
import EditTaskScreen from "../screens/EditTaskScreen";
import TaskDetailsScreen from "../screens/TaskDetailsScreen";
import FocusModeScreen from "../screens/FocusModeScreen";
import InsightsScreen from "../screens/InsightsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme/colors";
import type { AppStackParamList } from "./types";

const Stack = createNativeStackNavigator<AppStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: "New task" }} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: "Edit task" }} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: "Task details" }} />
      <Stack.Screen name="FocusMode" component={FocusModeScreen} options={{ title: "Focus mode" }} />
      <Stack.Screen name="Insights" component={InsightsScreen} options={{ title: "Insights" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Stack.Navigator>
  );
}
