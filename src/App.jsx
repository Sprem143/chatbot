import { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import './App.css'
import axios from 'axios';

function App() {

  const local = 'http://localhost:8000'
  const server = 'https://chatbot-4tip.onrender.com'
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([{ sender: 'ai', text: "You can ask Qustion only about Astro Nupur" },])

  const [showform, setShowform] = useState(false)
  const [showcontent, setShowcontent] = useState(false)
  const handledisplayform = () => setShowform(!showform)
  const handledisplaycontent = () => setShowcontent(!showcontent)
  const queryAPI = async () => {
    if (!question.trim()) return;

    const userMessage = { sender: 'user', text: question };
    setMessages((prev) => [...prev, userMessage]);
    console.log(userMessage)
    const res = await fetch(`${local}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await res.json();
    const aiMessage = { sender: 'ai', text: data.answer };
    setMessages((prev) => [...prev, aiMessage]);
    setQuestion('')
    console.log(data.answer); // <- your RAG response
  };

  const [url, setUrl] = useState('')
  const [urllist, setUrllist] = useState([])
  const scrap_web = async () => {
    if (!url.trim()) return
    console.log(url)
    let resp = await fetch(`${local}/scrap`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    resp = await resp.json()
    console.log(resp)
  }

  const scrap_suburl = async () => {
    if (!url.trim()) return
    console.log(url)
    let resp = await fetch(`${local}/suburl`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    resp = await resp.json()
    setUrllist(resp.url)
    console.log(resp)
  }

  // ------add content-----
  const [content, setContent] = useState('')
  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/add_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (response.ok) {
        setContent('');
      } else {
        alert(result.detail)
        console.log(result.detail)
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error. Please try again later.');
    }
  };
  useEffect(() => {
    getcontent()
  }, [])

  const [savedContent, setSavedContent] = useState('')
  async function getcontent() {
    let result = await fetch('http://localhost:8000/get_content', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    result = await result.json();
    setSavedContent(result.content.content);
    console.log(result.content.content)
  }

  async function deletecontent() {
    let result = await fetch('http://localhost:8000/delete_all_content', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    result = await result.json();
    console.log(result)
    result.status ? alert('Content Deleted') : alert('Error while deleting')
  }

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
   const selectedFile = e.target.files[0];
  
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
      setStatus("");

      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target.result);
      };
      reader.readAsText(selectedFile);
    } else {
      setFile(null);
      setContent("");
      setStatus("Only .txt files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a .txt file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${local}/upload_textfile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus(res.data.message);
    } catch (err) {
      console.error(err);
      setStatus("Error uploading file.");
    }
  };

  return (
    <>

      {/* header */}
      <Navbar bg="dark" data-bs-theme="dark" key="md" expand="md" style={{ background: 'black', color: 'white' }} className="border text-white border-secondary border-start-0 border-end-0 ps-4" >
        <Container fluid className='p-0'>
          <Navbar.Brand href="/" className='fs-3'><img src="/static/logo.png" height={60} alt="logo" className='me-4' style={{ borderRadius: '0%' }} /><span className="text-white">AI Chatbot</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-lg`} style={{ color: 'white' }} />
          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-lg`}
            aria-labelledby={`offcanvasNavbarLabel-expand-lg`}
            placement="end"
            style={{ background: 'black' }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand-lg`} className='text-white'>
                AI Chatbot   </Offcanvas.Title>
            </Offcanvas.Header>


          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      <div className="d-flex justify-content-center">
        <button className='nobtn' onClick={handledisplaycontent}>Saved Content</button>
        <button className='nobtn' onClick={handledisplayform}>Add New Content</button>
        <button className='nobtn' onClick={deletecontent}>Delete Content</button>
      </div>
      {/* ---------main page */}
      <div className="p-4 d-flex flex-column align-items-center">
        <div className="min-h-screen  flex flex-col chatbox aiicon">
          <div className="d-flex flex-column overflow-auto p-4  space-y-4" style={{ background: '#ffffff30', borderRadius: '25px' }}>
            {messages.map((msg, idx) => (
              <>
                {msg.sender == 'user' && <div className='d-flex'><p className='questionbox'>{msg.text}</p></div>}
                {msg.sender == 'ai' && <div className='d-flex justify-content-end'><p className='answerbox'>{msg.text}</p></div>}
              </>
            ))}
          </div>
          <div className="p-4 border-t flex" style={{ background: 'rgb(255 255 255 / 25%) !important' }}>
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-4 py-2 mr-2 inputbox"
              placeholder="Type your message..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && queryAPI()}
            />
            <button
              className="bg-blue-500 border px-4 py-2 ms-2 rounded"
              onClick={queryAPI}
            >
              Send
            </button>
          </div>

        </div>
        {/* <div className="container">
        <input type="text" onChange={(e) => setUrl(e.target.value)} />
        <button onClick={scrap_web}>Scrap And Save</button>
      </div> */}
        {/* {Array.isArray(urllist) && urllist.length > 0 &&
        <ul>
          {urllist.map((url) => (
            <li> <a href={url}>{url}</a></li>
          ))}
        </ul>
      } */}


        {/* -add content form */}
        {showform &&
          <div className="container">
            <div className="row">
              <div className="col-md-4 col-sm-12">
                <div className='formbox'>
                  <h3>Add New Content</h3>
                  <form onSubmit={handleAddContent}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      cols={30}
                      placeholder="Enter content"
                    />
                    <br />
                    <button type="submit">Add Content</button>
                    <button className='ms-3' onClick={handledisplayform}>close</button>
                  </form>
                </div>
                <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
                  <h2 className="text-xl font-semibold mb-4">Upload .txt File</h2>
                  <input type="file" accept=".txt" onChange={handleFileChange} />
                  <button
                    onClick={handleUpload}
                    className="mt-4 hover:bg-blue-600  px-4 py-2 rounded"
                  >
                    Upload
                  </button>
                  {status && <p className="mt-2 text-sm">{status}</p>}
                </div>
              </div>
              <div className="col-md-8 col-sm-12 p-4">
                <h3>Preview</h3>
                <hr />
                {content}
              </div>
            </div>
          </div>
        }
        {showcontent &&
          <div className="contentBox">
            {savedContent}
          </div>

        }
      </div>
    </>
  );
}

export default App
