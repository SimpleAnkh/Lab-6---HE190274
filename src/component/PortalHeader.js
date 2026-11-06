import { Link, useNavigate } from 'react-router-dom';

const SESSION_KEY = 'userSession';

function PortalHeader({ session, title = 'FPT Education Learning Materials Portal' }) {
	const navigate = useNavigate();
	const role = session.role?.toLowerCase() === 'lecturer' ? 'Lecture' : session.role;

	function handleLogout() {
		localStorage.removeItem(SESSION_KEY);
		navigate('/login', { replace: true });
	}

	return (
		<header className="portal-header">
			<Link className="portal-title" to="/syllabus">
				{title}
			</Link>
			<div className="portal-user">
				<span className="welcome-message">
					Hello, {session.fullName || session.email} ({role})
				</span>
				<button className="logout-button" type="button" onClick={handleLogout}>
					Logout
				</button>
			</div>
		</header>
	);
}

export default PortalHeader;