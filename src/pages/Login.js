import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const Login = () => {
	// Sat page default state
	const [data, setData] = useState({
		email: '',
		password: '',
		error: '',
		loading: false,
	});
	// Use navigation hook to redirect user
	const navigate = useNavigate();
	// Destructure state into variables
	const { email, password, error, loading } = data;
	/**
	 * Called on input change and sets input values to the state
	 * @param {*} event event performed on the inputs
	 */
	const handleChange = (event) => {
		// Grabbing target by name and save to the state with previous state
		setData({ ...data, [event.target.name]: event.target.value });
	};

	/**
	 * Handles login form submission and calls firebase function to login user
	 * @param {*} event event performed on the form
	 */
	const handleSubmit = async (event) => {
		event.preventDefault();
		// Set error if one of the fields are missing
		if (!email || !password) {
			setData({ ...data, error: 'All fields are required' });
		}
		try {
			// use firebase function and store result in a variable
			const result = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			// Update user doc to set it online
			await updateDoc(doc(db, 'users', result.user.uid), {
				isOnline: true,
			});
			// Clear inputs
			setData({ email: '', password: '', error: '', loading: false });
			// Navigate to home page
			navigate('/');
		} catch (error) {
			// Store the error in the state to display on the form
			setData({ ...data, error: error.message });
		}
	};

	return (
		<section>
			<h3>Login to your account</h3>
			<form className='form' onSubmit={handleSubmit}>
				<div className='input_container'>
					<label htmlFor='email'>Email</label>
					<input
						type='email'
						name='email'
						value={email}
						onChange={handleChange}
					/>
				</div>
				<div className='input_container'>
					<label htmlFor='password'>Password</label>
					<input
						type='password'
						name='password'
						value={password}
						onChange={handleChange}
					/>
				</div>
				{error && <p className='error'>{error}</p>}
				<div className='btn_container'>
					<button type='submit' className='btn'>
						{loading ? 'Logging in ...' : 'Login'}
					</button>
				</div>
			</form>
		</section>
	);
};

export default Login;
