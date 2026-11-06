import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PortalHeader from './PortalHeader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
const SESSION_KEY = 'userSession';

function formatPrerequisites(value) {
	const prerequisites = Array.isArray(value) ? value : [value];
	return prerequisites
		.flatMap((item) => String(item || '').split(/[;,]/))
		.map((item) => item.trim())
		.filter(Boolean)
		.join(', ');
}

function Subject() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [subject, setSubject] = useState(null);
	const [formData, setFormData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState('');
	const [notice, setNotice] = useState('');
	const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

	useEffect(() => {
		const controller = new AbortController();

		async function loadSubject() {
			try {
				const response = await fetch(`${API_URL}/subjects/${encodeURIComponent(id)}`, {
					signal: controller.signal,
				});
				if (!response.ok) {
					throw new Error('Subject not found.');
				}
				const data = await response.json();
				setSubject(data);
				setFormData({
					code: data.code || '',
					name: data.name || '',
					curriculum: data.curriculum || '',
					semester: data.semester ?? '',
					credits: data.credits ?? '',
					preRequisites: formatPrerequisites(data.preRequisites),
					description: data.description || '',
				});
			} catch (requestError) {
				if (requestError.name !== 'AbortError') {
					setError(requestError.message || 'Unable to load this subject.');
				}
			} finally {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			}
		}

		loadSubject();
		return () => controller.abort();
	}, [id]);

	function updateField(event) {
		const { name, value } = event.target;
		setFormData((current) => ({ ...current, [name]: value }));
	}

	function handleEdit() {
		setError('');
		setNotice('');
		setIsEditing(true);
	}

	function handleCancel() {
		setFormData({
			code: subject.code || '',
			name: subject.name || '',
			curriculum: subject.curriculum || '',
			semester: subject.semester ?? '',
			credits: subject.credits ?? '',
			preRequisites: formatPrerequisites(subject.preRequisites),
			description: subject.description || '',
		});
		setError('');
		setIsEditing(false);
	}

	async function handleSave(event) {
		event.preventDefault();
		setError('');
		setNotice('');
		setIsSaving(true);

		const updatedSubject = {
			...formData,
			semester: Number(formData.semester),
			credits: Number(formData.credits),
			preRequisites: formData.preRequisites
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
		};

		try {
			const response = await fetch(`${API_URL}/subjects/${encodeURIComponent(id)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedSubject),
			});
			if (!response.ok) {
				throw new Error('Unable to save subject changes. Please try again.');
			}

			const savedSubject = await response.json();
			setSubject(savedSubject);
			setFormData({
				...savedSubject,
				preRequisites: formatPrerequisites(savedSubject.preRequisites),
			});
			setIsEditing(false);
			setNotice('Subject changes saved.');
		} catch (requestError) {
			setError(requestError.message || 'Unable to save subject changes.');
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		if (!window.confirm(`Delete ${subject.code} - ${subject.name}? This cannot be undone.`)) {
			return;
		}

		setError('');
		setIsDeleting(true);
		try {
			const response = await fetch(`${API_URL}/subjects/${encodeURIComponent(id)}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Unable to delete subject. Please try again.');
			}
			navigate('/syllabus', { replace: true });
		} catch (requestError) {
			setError(requestError.message || 'Unable to delete subject.');
			setIsDeleting(false);
		}
	}

	return (
		<main className="portal-page">
			<PortalHeader session={session} title="Subject Detail Management" />
			<section className="syllabus-content detail-content">
				<Link className="detail-back-button" to="/syllabus">Back to List</Link>
				{isLoading ? (
					<p className="list-message" role="status">Loading subject...</p>
				) : error && !subject ? (
					<>
						<p className="list-message error-message" role="alert">{error}</p>
						<Link className="detail-back-button" to="/syllabus">Back to List</Link>
					</>
				) : (
					<>
						<h1>{subject.name}</h1>
						{notice && <p className="save-notice" role="status">{notice}</p>}
						{error && <p className="form-error detail-form-error" role="alert">{error}</p>}
						<form className="subject-detail-form" onSubmit={handleSave}>
							<div className="detail-field">
								<label htmlFor="subject-code">Code</label>
								<input id="subject-code" name="code" value={formData.code} onChange={updateField} readOnly={!isEditing} required />
							</div>
							<div className="detail-field">
								<label htmlFor="subject-name">Name</label>
								<input id="subject-name" name="name" value={formData.name} onChange={updateField} readOnly={!isEditing} required />
							</div>
							<div className="detail-field">
								<label htmlFor="subject-curriculum">Curriculum</label>
								<input id="subject-curriculum" name="curriculum" value={formData.curriculum} onChange={updateField} readOnly={!isEditing} />
							</div>
							<div className="detail-field">
								<label htmlFor="subject-semester">Semester</label>
								<input id="subject-semester" name="semester" type="number" min="1" value={formData.semester} onChange={updateField} readOnly={!isEditing} />
							</div>
							<div className="detail-field">
								<label htmlFor="subject-credits">Credits</label>
								<input id="subject-credits" name="credits" type="number" min="0" value={formData.credits} onChange={updateField} readOnly={!isEditing} />
							</div>
							<div className="detail-field detail-field-wide">
								<label htmlFor="subject-prerequisites">Pre-requisites</label>
								<input id="subject-prerequisites" name="preRequisites" value={formData.preRequisites} onChange={updateField} readOnly={!isEditing} />
							</div>
							<div className="detail-field detail-field-wide">
								<label htmlFor="subject-description">Description</label>
								<textarea id="subject-description" name="description" rows="4" value={formData.description} onChange={updateField} readOnly={!isEditing} />
							</div>
							<div className="detail-actions">
								{isEditing ? (
									<>
										<button className="detail-primary-button" type="submit" disabled={isSaving || isDeleting}>
											{isSaving ? 'Saving...' : 'Save'}
										</button>
										<button className="detail-secondary-button" type="button" onClick={handleCancel} disabled={isSaving || isDeleting}>Cancel</button>
									</>
								) : (
									<button className="detail-primary-button" type="button" onClick={handleEdit} disabled={isDeleting}>Edit</button>
								)}
								<button className="detail-delete-button" type="button" onClick={handleDelete} disabled={isSaving || isDeleting}>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</button>
							</div>
						</form>
					</>
				)}
			</section>
		</main>
	);
}

export default Subject;
