/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import Camera from '../components/svg/Camera';
import { storage, db, auth } from '../services/firebase';
import {
	ref,
	getDownloadURL,
	uploadBytes,
	deleteObject,
} from 'firebase/storage';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import Img from '../default.png';
import TrashCan from '../components/svg/TrashCan';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
	const [img, setImg] = useState('');
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	const handleImageChange = (e) => {
		setImg(e.target.files[0]);
	};

	useEffect(() => {
		getDoc(doc(db, 'users', auth.currentUser.uid)).then((docSnap) => {
			if (docSnap.exists()) {
				setUser(docSnap.data());
			}
		});

		if (img) {
			const uploadImg = async () => {
				try {
					const imgRef = ref(
						storage,
						`avatar/${new Date().getTime()} - ${img.name}`
					);
					if (user.avatarPath) {
						await deleteObject(ref(storage, user.avatarPath));
					}
					const snap = await uploadBytes(imgRef, img);
					const url = await getDownloadURL(
						ref(storage, snap.ref.fullPath)
					);
					await updateDoc(doc(db, 'users', user.uid), {
						avatar: url,
						avatarPath: snap.ref.fullPath,
					});
					setImg('');
				} catch (error) {
					console.log(error);
				}
			};
			uploadImg();
		}
	}, [img]);

	const deleteImage = async () => {
		try {
			const confirm = window.confirm('Delete Avatar?');
			if (confirm) {
				await deleteObject(ref(storage, user.avatarPath));
				await updateDoc(doc(db, 'users', user.uid), {
					avatar: '',
					avatarPath: '',
				});
				navigate('/');
			}
		} catch (error) {
			console.log(error);
		}
	};

	return user ? (
		<section>
			<div className='profile_container'>
				<div className='image_container'>
					<img src={user.avatar || Img} alt='profile avatar' />
					<div className='overlay'>
						<div>
							<label htmlFor='photo'>
								<Camera />
							</label>
							{user.avatar && (
								<TrashCan deleteImage={deleteImage} />
							)}
							<input
								type='file'
								accept='image/*'
								style={{ display: 'none' }}
								id='photo'
								onChange={handleImageChange}
							/>
						</div>
					</div>
				</div>
				<div className='text_container'>
					<h3>{user.name}</h3>
					<p>{user.email}</p>
					<hr />
					<small>
						Joined on: {user.createdAt.toDate().toDateString()}
					</small>
				</div>
			</div>
		</section>
	) : null;
};

export default Profile;
