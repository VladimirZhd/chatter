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
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import User from '../components/User';
import MessageForm from '../components/MessageForm';
import Message from '../components/Message';

const Home = () => {
	const [users, setUsers] = useState([]);
	const [chat, setChat] = useState('');
	const [text, setText] = useState('');
	const [img, setImg] = useState('');
	const [msgs, setMsgs] = useState([]);

	// Get uid for logged in user
	const loggedInUserUID = auth.currentUser.uid;

	useEffect(() => {
		// Create a reference for users collection
		const usersRef = collection(db, 'users');
		// Query all users from user collection except logged in user
		const q = query(usersRef, where('uid', 'not-in', [loggedInUserUID]));
		// Store the function to cleanup after unmount of the component
		const unsub = onSnapshot(q, (querySnapshot) => {
			let users = [];
			querySnapshot.docs.forEach((doc) => {
				users.push(doc.data());
			});
			// Set users to returned documents from database
			setUsers(users);
		});
		return unsub;
	}, []);

	/**
	 * The function selects a user on the home page
	 * Opens the chat between selected user and logged in user
	 * Retrieves all previous messages for both users if any
	 * @param {Selected user on the page} user
	 */
	const selectUser = async (user) => {
		// Set current chat to messaging user
		setChat(user);
		// Get messaging user uid
		const messagingUserUID = user.uid;
		// Create unique id for the chat
		// With this rule id will always be the same
		// No matter which user is logged in
		const id =
			loggedInUserUID > messagingUserUID
				? `${loggedInUserUID + messagingUserUID}`
				: `${messagingUserUID + loggedInUserUID}`;

		// Create reference to messages collection and chat sub collection
		const msgsRef = collection(db, 'messages', id, 'chat');
		// query all messages and order by ascending
		const q = query(msgsRef, orderBy('createdAt', 'asc'));
		// savve all messages to the state
		onSnapshot(q, (querySnapshot) => {
			let msgs = [];
			querySnapshot.forEach((doc) => {
				msgs.push(doc.data());
			});
			setMsgs(msgs);
		});
		// Save a last send message to it's own collection
		const docSnap = await getDoc(doc(db, 'lastMsg', id));
		if (docSnap.data() && docSnap.data().from !== loggedInUserUID) {
			await updateDoc(doc(db, 'lastMsg', id), {
				unread: false,
			});
		}
	};
	/**
	 * Handles form submission and creates documents for
	 * messages collection and last message
	 * Stores image in the storage and stores url in documents
	 * @param {*} event event performed on the form
	 */
	const handleSubmit = async (event) => {
		event.preventDefault();
		const messagingUserUID = chat.uid;

		const id =
			loggedInUserUID > messagingUserUID
				? `${loggedInUserUID + messagingUserUID}`
				: `${messagingUserUID + loggedInUserUID}`;

		let url;
		if (img) {
			// Create reference for the image
			const imgRef = ref(
				storage,
				`images/${new Date().getTime()} - ${img.name}`
			);
			// Upload the image to the storage
			const snap = await uploadBytes(imgRef, img);
			// Get the the url for img from snapshot
			const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
			url = dlUrl;
		}

		// Add a message to messages collection
		await addDoc(collection(db, 'messages', id, 'chat'), {
			text,
			from: loggedInUserUID,
			to: messagingUserUID,
			createdAt: Timestamp.fromDate(new Date()),
			media: url || '',
		});
		// Add last sent message to last message collection
		await setDoc(doc(db, 'lastMsg', id), {
			text,
			from: loggedInUserUID,
			to: messagingUserUID,
			createdAt: Timestamp.fromDate(new Date()),
			media: url || '',
			unread: true,
		});
		// Set input text to empty string
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
