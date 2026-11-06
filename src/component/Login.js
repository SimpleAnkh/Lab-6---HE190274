import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
const SESSION_KEY = 'userSession';

function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(event) {
		event.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const query = new URLSearchParams({ email: email.trim() });
			const response = await fetch(`${API_URL}/accounts?${query}`);
			if (!response.ok) {
				throw new Error('Unable to connect to the account service.');
			}

			const accounts = await response.json();
			const account = accounts.find((item) => item.password === password);

			if (!account) {
				setError('Email or password is incorrect.');
				return;
			}

			if (account.status?.toLowerCase() !== 'active') {
				setError('Tài khoản đã bị khóa');
				return;
			}

			if (!['student', 'lecture', 'lecturer'].includes(account.role?.toLowerCase())) {
				setError('This account does not have permission to sign in.');
				return;
			}

			const session = {
				id: account.id,
				email: account.email,
				fullName: account.fullName,
				role: account.role,
			};
			localStorage.setItem(SESSION_KEY, JSON.stringify(session));
			navigate('/syllabus', { replace: true });
		} catch (requestError) {
			setError(requestError.message || 'Unable to sign in. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main className="login-page">
			<section className="login-card" aria-labelledby="login-title">
				<h1 id="login-title">Sign In</h1>

				<form onSubmit={handleSubmit}>
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						autoComplete="username"
						placeholder="email of student or lecture"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>

					<label htmlFor="password">Password</label>
					<input
						id="password"
						type="password"
						autoComplete="current-password"
						placeholder="Enter password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>

					{error && <p className="form-error" role="alert">{error}</p>}
					<button className="login-button" type="submit" disabled={isLoading}>
						{isLoading ? 'Signing in...' : 'Login'}
					</button>
				</form>
			</section>
		</main>
	);
}

export default Login;
