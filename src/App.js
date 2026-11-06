import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './component/Login';
import Syllabus from './component/Syllabus';
import Subject from './component/Subject';
import './App.css';

const SESSION_KEY = 'userSession';

function RequireAuth({ children }) {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return session ? children : <Navigate to="/login" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/syllabus" element={<RequireAuth><Syllabus /></RequireAuth>} />
                <Route path="/subject/:id" element={<RequireAuth><Subject /></RequireAuth>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;