/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import Img from '../default.png';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const User = ({ user, selectUser, loggedInUser, chat }) => {
	const messagingUserUID = user?.uid;
	const [data, setData] = useState('');

	useEffect(() => {
		const id =
			loggedInUser.uid > messagingUserUID
				? `${loggedInUser.uid + messagingUserUID}`
				: `${messagingUserUID + loggedInUser.uid}`;
		let unsub = onSnapshot(doc(db, 'lastMsg', id), (doc) => {
			setData(doc.data());
		});
		return unsub;
	}, []);

	return (
		<div
			className={`user_wrapper ${
				chat.name === user.name && 'selected_user'
			}`}
			onClick={() => selectUser(user)}>
			<div className='user_info'>
				<div className='user_detail'>
					<img
						src={user.avatar || Img}
						alt='avatar'
						className='avatar'
					/>
					<h4>{user.name}</h4>
					{data?.from !== loggedInUser.uid && data?.unread && (
						<small className='unread'>New</small>
					)}
				</div>
				<div
					className={`user_status ${
						user.isOnline ? 'online' : 'offline'
					}`}></div>
			</div>
			{data && (
				<p className='truncate'>
					<strong>Me: </strong>
					{data.text}
				</p>
			)}
		</div>
	);
};

export default User;
