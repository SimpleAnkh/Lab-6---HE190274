import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalHeader from './PortalHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
const SESSION_KEY = 'userSession';

function Syllabus() {
	const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
	const [subjects, setSubjects] = useState([]);
	const [searchBy, setSearchBy] = useState('code');
	const [keyword, setKeyword] = useState('');
	const [activeSearch, setActiveSearch] = useState({ field: 'code', keyword: '' });
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const controller = new AbortController();

		async function loadSubjects() {
			try {
				const response = await fetch(`${API_URL}/subjects`, { signal: controller.signal });
				if (!response.ok) {
					throw new Error('Unable to load subjects. Please try again.');
				}
				setSubjects(await response.json());
			} catch (requestError) {
				if (requestError.name !== 'AbortError') {
					setError(requestError.message || 'Unable to load subjects.');
				}
			} finally {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		}

		loadSubjects();
		return () => controller.abort();
	}, []);

	function handleSearch(event) {
		event.preventDefault();
		setActiveSearch({ field: searchBy, keyword: keyword.trim().toLowerCase() });
	}

	const filteredSubjects = subjects.filter((subject) => {
		if (!activeSearch.keyword) return true;
		return String(subject[activeSearch.field] || '')
			.toLowerCase()
			.includes(activeSearch.keyword);
	});

	return (
		<main className="portal-page">
			<PortalHeader session={session} />
			<section className="syllabus-content">
				<div className="page-heading">
					<div>
						<h1>Syllabus Management</h1>
					</div>
				</div>

				<form className="subject-search" onSubmit={handleSearch}>
					<label htmlFor="search-by">Search by</label>
					<select
						id="search-by"
						value={searchBy}
						onChange={(event) => setSearchBy(event.target.value)}
					>
						<option value="code">Code</option>
						<option value="name">Name</option>
					</select>
					<label className="visually-hidden" htmlFor="subject-keyword">Keyword</label>
					<input
						id="subject-keyword"
						type="search"
						placeholder={`Enter keyword...`}
						value={keyword}
						onChange={(event) => setKeyword(event.target.value)}
					/>
					<button type="submit">Search</button>
				</form>

				{error && <p className="list-message error-message" role="alert">{error}</p>}
				{isLoading ? (
					<p className="list-message" role="status">Loading subjects...</p>
				) : !error && (
					<div className="subject-table-wrap">
						<table className="subject-table">
							<thead>
								<tr>
									<th scope="col">Code</th>
									<th scope="col">Name</th>
									<th scope="col">Curriculum</th>
									<th scope="col">Semester</th>
									<th scope="col">Credits</th>
									<th scope="col">Pre-requisites</th>
									<th scope="col">Description</th>
								</tr>
							</thead>
							<tbody>
								{filteredSubjects.map((subject) => (
									<tr key={subject.id}>
										<td>
											<Link className="subject-code" to={`/subject/${subject.id}`}>
												{subject.code}
											</Link>
										</td>
										<td className="subject-name">{subject.name}</td>
										<td>{subject.curriculum || '—'}</td>
										<td>{subject.semester ?? '—'}</td>
										<td>{subject.credits ?? '—'}</td>
										<td>{Array.isArray(subject.preRequisites)
											? subject.preRequisites.join(', ') || 'None'
											: subject.preRequisites || 'None'}</td>
										<td>{subject.description || '—'}</td>
									</tr>
								))}
							</tbody>
						</table>
						{filteredSubjects.length === 0 && (
							<p className="list-message" role="status">No subjects match your search.</p>
						)}
					</div>
				)}
			</section>
		</main>
	);
}

export default Syllabus;
