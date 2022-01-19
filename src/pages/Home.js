/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { auth, db, storage } from '../services/firebase';
import {
	collection,
	query,
	where,
	onSnapshot,
	addDoc,
	Timestamp,
	orderBy,
	setDoc,
	doc,
	getDoc,
	updateDoc,
} from 'firebase/firestore';
import { ref, getDownloadURL, getBytes, uploadBytes } from 'firebase/storage';
import User from '../components/User';
import MessageForm from '../components/MessageForm';
import Message from '../components/Message';

const Home = () => {
	const [users, setUsers] = useState([]);
	const [chat, setChat] = useState('');
	const [text, setText] = useState('');
	const [img, setImg] = useState('');
	const [msgs, setMsgs] = useState([]);

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

	const selectUser = async (user) => {
		setChat(user);

		const messagingUserUID = user.uid;
		const id =
			loggedInUserUID > messagingUserUID
				? `${loggedInUserUID + messagingUserUID}`
				: `${messagingUserUID + loggedInUserUID}`;

		const msgsRef = collection(db, 'messages', id, 'chat');
		const q = query(msgsRef, orderBy('createdAt', 'asc'));

		onSnapshot(q, (querySnapshot) => {
			let msgs = [];
			querySnapshot.forEach((doc) => {
				msgs.push(doc.data());
			});
			setMsgs(msgs);
		});

		const docSnap = await getDoc(doc(db, 'lastMsg', id));
		if (docSnap.data() && docSnap.data().from !== loggedInUserUID) {
			await updateDoc(doc(db, 'lastMsg', id), {
				unread: false,
			});
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const messagingUserUID = chat.uid;

		const id =
			loggedInUserUID > messagingUserUID
				? `${loggedInUserUID + messagingUserUID}`
				: `${messagingUserUID + loggedInUserUID}`;

		let url;
		if (img) {
			const imgRef = ref(
				storage,
				`images/${new Date().getTime()} - ${img.name}`
			);
			const snap = await uploadBytes(imgRef, img);
			const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
			url = dlUrl;
		}

		await addDoc(collection(db, 'messages', id, 'chat'), {
			text,
			from: loggedInUserUID,
			to: messagingUserUID,
			createdAt: Timestamp.fromDate(new Date()),
			media: url || '',
		});

		await setDoc(doc(db, 'lastMsg', id), {
			text,
			from: loggedInUserUID,
			to: messagingUserUID,
			createdAt: Timestamp.fromDate(new Date()),
			media: url || '',
			unread: true,
		});

		setText('');
	};
	return (
		<div className='home_container'>
			<div className='users_container'>
				{users.map((user) => (
					<User
						key={user.uid}
						user={user}
						selectUser={selectUser}
						loggedInUser={auth.currentUser}
						chat={chat}
					/>
				))}
			</div>
			<div className='messages_container'>
				{chat ? (
					<>
						<div className='messages_user'>
							<h3>{chat.name}</h3>
						</div>
						<div className='messages'>
							{msgs &&
								msgs.map((msg, i) => (
									<Message
										key={i}
										msg={msg}
										loggedInUser={loggedInUserUID}
									/>
								))}
						</div>
						<MessageForm
							handleSubmit={handleSubmit}
							text={text}
							setText={setText}
							setImg={setImg}
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
