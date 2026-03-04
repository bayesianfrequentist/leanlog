import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import TodayScreen from './screens/TodayScreen';
import NutritionScreen from './screens/NutritionScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import BodyScreen from './screens/BodyScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  return (
    <BrowserRouter basename="/leanlog">
      <Routes>
        <Route path="/" element={<TodayScreen />} />
        <Route path="/nutrition" element={<NutritionScreen />} />
        <Route path="/workouts" element={<WorkoutScreen />} />
        <Route path="/body" element={<BodyScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
