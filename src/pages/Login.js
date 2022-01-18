import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { auth, db } from "../services/firebase";

const Login = () => {
    const [data, setData] = useState({
        email: '',
        password: '',
        error: '',
        loading: false
    });

    const navigate = useNavigate();

    const { email, password, error, loading } = data;

    const handleChange = (event) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email || !password) {
            setData({ ...data, error: 'All fields are required' });
        }
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await updateDoc(doc(db, 'users', result.user.uid), {
                isOnline: true
            });
            setData({ email: '', password: '', error: '', loading: false });
            navigate('/');
        } catch (error) {
            setData({ ...data, error: error.message });
        }
    };

    return (
        <section>
            <h3>Login to your account</h3>
            <form className="form" onSubmit={handleSubmit}>
                <div className="input_container">
                    <label htmlFor="email">Email</label>
                    <input type='email' name='email' value={email} onChange={handleChange} />
                </div>
                <div className="input_container">
                    <label htmlFor="password">Password</label>
                    <input type='password' name='password' value={password} onChange={handleChange} />
                </div>
                {error && <p className="error">{error}</p>}
                <div className="btn_container">
                    <button type='submit' className="btn">{loading ? 'Logging in ...' : 'Login'}</button>
                </div>
            </form>
        </section>
    );
};

export default Login;