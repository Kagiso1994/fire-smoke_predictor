
import './App.css';
import file from './assets/file.png'
import { useState } from 'react'
import axios from 'axios';
import { ColorRing, Circles } from 'react-loader-spinner'
import { storage, db, analytics } from './firebase';
import { addDoc, collection } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
//import { ProgressBar } from 'react-bootstrap';

function App() {

    const [ImageName, setImageName] = useState('')
    const [ImageSize, setImageSize] = useState('')
    const [ImageUploaded, setImageUploaded] = useState(false)
    const [Proccesed, setProccesed] = useState(undefined)
    const [Predicted, setPredicted] = useState(undefined)
    const [DisplayReults, setDisplayReults] = useState(undefined)
    const [ImageDescription, setImageDescription] = useState('')
    const [PreviewImage, setPreviewImage] = useState(null)
    const [progressImage, setprogressImage] = useState(0)

    const CollectionRef = collection(db, 'stats')

    const handleimage = async (e) => {
        //console.log(e.target.files)

        const file = e.target.files[0];
        var fileType = file.name.substr(file.name.lastIndexOf("."));
        if (fileType.toLowerCase() !== '.png' && fileType.toLowerCase() !== '.jpeg' && fileType.toLowerCase() !== '.jpg') return alert('jpg, jpeg or png files only')
        console.log(fileType)
        console.log(file)
        setPreviewImage(file)
        setImageName(file.name)
        var kb = Number(file.size) / 1000
        setImageSize(kb.toFixed(2))
        setImageUploaded(true)
        setDisplayReults(false)
        setProccesed(false)
        setPredicted(false)

        var formData = new FormData();
        formData.append("file", file)
        await axios.post('http://192.168.0.133:8080/api/predict?model_name=Resnet50', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((response) => {

                if (!file) return;
                const storageRef = ref(storage, `/assets/${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);
                uploadTask.on("state_changed", (snapshot) => {
                    const prog = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
                    setprogressImage(prog);
                },
                    (err) => console.log(err),
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref)
                            .then(url => {
                                var date = new Date().toLocaleString()
                                addDoc(CollectionRef, { image: url, timeStamp: date, respond: response.data })
                                    .then(() => {
                                        console.log(response)
                                        setProccesed(true)
                                        setImageDescription(response.data)
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file);

                                        setTimeout(() => {
                                            setPredicted(true)

                                        }, 2000);

                                        setTimeout(() => {
                                            console.log(reader.result)
                                            setPreviewImage(reader.result)
                                            setDisplayReults(true)
                                        }, 3000);
                                    }, (err)=>{console.log(err)})
                            })

                    }
                );


            }, (err) => {
                console.log(err)
            })

    }

    function closeContent() {
        logEvent(analytics, 'reset fired')
        setImageUploaded(false)
        setProccesed(false)
        setImageName('')
        setImageSize('')

    }

    function closeResults() {
        setDisplayReults(undefined)
    }

    let firstArea = (
        <div className='upper-side-bar'>
            <label id="header-text">App Status</label>
            <label id="prompt-text">Please upload a raw image</label>
        </div>
    )

    let secondArea = (
        <div className='middle-side-bar'>

            <div className="upload-container">
                <label>Upload png file</label>
                <span>
                    <label>Click here upload file here</label>
                    <label id="limit-text">Limit 200 Mb per file.PNG</label>
                    <label for="file-image" id="button-upload" ><span>upload &nbsp; &nbsp;
                        <img src="" alt="" /> </span></label>
                    <input type="file" id="file-image" value="" onChange={handleimage} />
                </span>
            </div>
            {(ImageUploaded === true) && <span>
                <div className="uploaded-file">
                    <div className="image-file">
                        <img src={file} alt="uploaded file" />
                    </div>
                    <div className="image-description">
                        <label>{ImageName}</label>
                        <label>{ImageSize} MB</label>
                    </div>
                    <div className="image-cancel">
                        <label onClick={closeContent}>X</label>
                    </div>
                </div>
            </span>}
            <div className="file-processing">
                {(ImageUploaded === true) && <label>
                    {(Proccesed === false) &&
                        <ColorRing
                            visible={true}
                            height="30"
                            width="30"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                        />}
                    {(Proccesed === true) && <p>Pre-processing has been done...</p>}

                </label>}
                {(ImageUploaded === true) && <label>
                    {(Predicted === false) &&
                        <ColorRing
                            visible={true}
                            height="30"
                            width="30"
                            ariaLabel="blocks-loading"
                            wrapperStyle={{}}
                            wrapperClass="blocks-wrapper"
                            colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
                        />}
                    {(Predicted === true) && <p>Prediction has been done...</p>}
                </label>}
            </div>
        </div>
    )

    let thirdArea = (
        <div className="bottom-side-bar">
            <div id="side-button-reset">
                <button className="reset-btn" onClick={closeContent}>Reset</button>

            </div>
            <div id="side-button-exit">
                <button className="exit-btn">Exit</button>
            </div>
        </div>
    )

    let mainContent = (
        <div className="main-content">
            <div id="detected-cancel">
                <label onClick={closeResults}>X</label>
            </div>

            <label className="detected-image">Fire Detecting Using Image Processing</label>

            <div className="display-images">
                <div className="form-group">
                    <img src={PreviewImage} alt="original file" />
                </div>
            </div>

            <label className="detected-results">Results: {ImageDescription}</label>

        </div>
    )

    return (
        <div className="App">
            <div className="main">
                <div className="side-bar">
                    {firstArea}
                    {secondArea}
                    {thirdArea}
                </div>

                <div className="content">
                    {(DisplayReults === false) &&
                        <div className="content-load"><Circles
                            height="180"
                            width="150"
                            color="#4fa94d"
                            ariaLabel="circles-loading"
                            wrapperStyle={{ margin: 'auto' }}
                            wrapperClass=""
                            visible={true}
                        /></div>
                    }
                    {(DisplayReults === true) && (mainContent)}
                </div>
            </div>
        </div>
    );
}

export default App;
