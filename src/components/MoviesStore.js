import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";
import {
  MDBCard,
  MDBCardImage,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBCardGroup
} from 'mdb-react-ui-kit';
import { useAuth } from "../context/AuthContext";
import { db, auth, storage } from "../firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

export default function MoviesStore() {
      const [error, setError] = useState("");
      const { currentUser, logout } = useAuth();
      const navigate = useNavigate();
      const [movieList, setMovieList] = useState([]);

      // New Movie States
      const [newMovieTitle, setNewMovieTitle] = useState("");
      const [newReleaseDate, setNewReleaseDate] = useState(0);
      const [isNewMovieOscar, setIsNewMovieOscar] = useState(false);

      // Update Title State
      const [updatedTitle, setUpdatedTitle] = useState("");

      // File Upload State
      const [fileUpload, setFileUpload] = useState(null);

      const moviesCollectionRef = collection(db, "movies");

      const getMovieList = async () => {
        try {
          const data = await getDocs(moviesCollectionRef);
          const filteredData = data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setMovieList(filteredData);
        } catch (err) {
          console.error(err);
        }
      };

      useEffect(() => {
        getMovieList();
      }, []);

      const onSubmitMovie = async () => {
        try {
          await addDoc(moviesCollectionRef, {
            title: newMovieTitle,
            releaseDate: newReleaseDate,
            receivedAnOscar: isNewMovieOscar,
            userId: auth?.currentUser?.uid,
          });
          getMovieList();
        } catch (err) {
          console.error(err);
        }
      };

      const deleteMovie = async (id) => {
        const movieDoc = doc(db, "movies", id);
        await deleteDoc(movieDoc);
      };

      const updateMovieTitle = async (id) => {
        const movieDoc = doc(db, "movies", id);
        await updateDoc(movieDoc, { title: updatedTitle });
      };

      const uploadFile = async () => {
        if (!fileUpload) return;
        const filesFolderRef = ref(storage, `projectFiles/${fileUpload.name}`);
        try {
          await uploadBytes(filesFolderRef, fileUpload);
        } catch (err) {
          console.error(err);
        }
      };

      async function handleLogout() {
        setError("");
        try {
          await logout();
          navigate("/login");
        } catch {
          setError("Failed to log out");
        }
      }


    return (
        <>
          <h2 className="text-center mb-4">Movies Store</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <strong>Hello  {currentUser && currentUser.email.split("@",1)} </strong>,<br/> here you can find, add, modify or delete your favorite movies :
          <br/>
        
        <MDBCard>
          
          <MDBCardBody>
            <MDBCardTitle>Let's add a movie</MDBCardTitle>
            <MDBCardText>
              <input
                placeholder="Movie title..."
                onChange={(e) => setNewMovieTitle(e.target.value)}
              />
              <input
                placeholder="Release Date..."
                type="number"
                onChange={(e) => setNewReleaseDate(Number(e.target.value))}
              />
              <input
                type="checkbox"
                checked={isNewMovieOscar}
                onChange={(e) => setIsNewMovieOscar(e.target.checked)}
              />
              <label> Received an Oscar</label>
              <button onClick={onSubmitMovie}> Submit Movie</button>
            </MDBCardText>
          </MDBCardBody>
        </MDBCard>
        
        <MDBCard>
          <MDBCardBody>
            <MDBCardTitle>Your movies list</MDBCardTitle>
              {movieList.map((movie) => (

                <MDBCardText>
                  <h1 style={{ color: movie.receivedAnOscar ? "green" : "red" }}>
                    {movie.title}
                  </h1>
                  <p> Date: {movie.releaseDate} </p>
                  <input
                    placeholder="new title..."
                    onChange={(e) => setUpdatedTitle(e.target.value)}
                  />
                  <button onClick={() => updateMovieTitle(movie.id)}>
                    {" "}
                    Update Title
                  </button>
                  
                  <button onClick={() => deleteMovie(movie.id)}> Delete Movie</button>
                </MDBCardText>
              ))}
          </MDBCardBody>
        </MDBCard>

        <MDBCard>
          <MDBCardBody>
            <MDBCardTitle>Upgrading a file from here</MDBCardTitle>
                <MDBCardText>
                  <input type="file" onChange={(e) => setFileUpload(e.target.files[0])} />
                  <button onClick={uploadFile}> Upload File </button>
                </MDBCardText>
          </MDBCardBody>
        </MDBCard>
        
        <div className="w-100 text-center mt-2">
        <Link to="/">Retour au Dashboard</Link>
        </div>
        <div className="w-100 text-center mt-2">
            <Button className="btn btn-primary" onClick={handleLogout}>
            Log Out
            </Button>
        </div>
        </>
    );
}
