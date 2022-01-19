/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import {
	collection,
	query,
	where,
	onSnapshot,
	addDoc,
	Timestamp,
} from 'firebase/firestore';
import { ref, getDownloadURL, getBytes } from 'firebase/storage';
import User from '../components/User';
import MessageForm from '../components/MessageForm';

const Home = () => {
	const [users, setUsers] = useState([]);
	const [chat, setChat] = useState('');
	const [text, setText] = useState('');

	const loggedInUserUID = auth.currentUser.uid;

	useEffect(() => {
		const usersRef = collection(db, 'users');
		const q = query(usersRef, where('uid', 'not-in', [loggedInUserUID]));
		const unsub = onSnapshot(q, (querySnapshot) => {
			let users = [];
			querySnapshot.docs.forEach((doc) => {
				users.push(doc.data());
			});
			setUsers(users);
		});
		return unsub;
	}, []);

	const selectUser = (user) => {
		setChat(user);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const messagingUserUID = chat.uid;

		const id =
			loggedInUserUID > messagingUserUID
				? `${loggedInUserUID + messagingUserUID}`
				: `${messagingUserUID + loggedInUserUID}`;

		await addDoc(collection(db, 'messages', id, 'chat'), {
			text,
			from: loggedInUserUID,
			to: messagingUserUID,
			createdAt: Timestamp.fromDate(new Date()),
		});
		setText('');
	};
	return (
		<div className='home_container'>
			<div className='users_container'>
				{users.map((user) => (
					<User key={user.uid} user={user} selectUser={selectUser} />
				))}
			</div>
			<div className='messages_container'>
				{chat ? (
					<>
						<div className='messages_user'>
							<h3>{chat.name}</h3>
						</div>
						<MessageForm
							handleSubmit={handleSubmit}
							text={text}
							setText={setText}
						/>
					</>
				) : (
					<h3 className='no_conv'>
						Select a user to start conversation
					</h3>
				)}
			</div>
		</div>
	);
};

export default Home;
