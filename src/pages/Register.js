import { useState } from "react";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from "../services/firebase";

const Register = (props) => {
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        error: '',
        loading: false
    });
    const { name, email, password, error, loading } = data;

    const handleChange = (event) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setData({ ...data, error: '', loading: true });
        if (!name || !password || !email) {
            setData({ ...data, error: 'All fields are required' });
        }
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                name,
                email,
                createdAt: Timestamp.fromDate(new Date()),
                isOnline: true
            });
            setData({ name: '', email: '', password: '', error: '', loading: false });
        } catch (error) {

        }
    };

    return (
        <section>
            <h3>Create an account</h3>
            <form className="form" onSubmit={handleSubmit}>
                <div className="input_container">
                    <label htmlFor="name">Name</label>
                    <input type='text' name='name' value={name} onChange={handleChange} />
                </div>
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
                    <button type='submit' className="btn">Register</button>
                </div>
            </form>
        </section>
    );
};

export default Register;