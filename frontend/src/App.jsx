import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Recurring from './pages/Recurring';
import { PageHeader } from './components/Feedback';

function NotFound() {
  return <PageHeader title="Page not found" subtitle="Use the menu to go back to a page that exists." />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="recurring" element={<Recurring />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
