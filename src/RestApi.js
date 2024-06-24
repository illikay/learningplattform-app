import "./App.css"
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { createRoot } from "react-dom/client";

import {
  Button,
  EditableText,
  InputGroup,
  OverlayToaster,  
} from "@blueprintjs/core"

const AppToaster = await OverlayToaster.createAsync({ position: "top" }, {
  domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster),
});

const RestApi = (props) =>  {
  const [exams, setExams] = useState([])
  const [newName, setNewName] = useState("")
  const [newInfo, setNewInfo] = useState("")
  const [newBeschreibung, setNewBeschreibung] = useState("")
  const [user, setUser] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const fetchExams = async () => {
        try {
          const response = await fetch("http://localhost:7634/exam", {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${parsedUser.token}`,
              'Content-Type': 'application/json'
            },
          });

          if (!response.ok) {
            if (response.status === 403) {
              props.setLoggedIn(false);
              window.alert('Forbidden: You do not have permission to access this resource.');              
              navigate('/login');
              return;
            }
            window.alert('Network response was not ok: ' + response.statusText);
            return;
          }

          const json = await response.json();
          setExams(json);
        } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
          window.alert('An error occurred while fetching the exams. Please try again later.');
        }
      };

      fetchExams();
    }
  }, [navigate, props]);
  const addExam = () => {
    const pruefungsName = newName.trim()
    const info = newInfo.trim()
    const beschreibung = newBeschreibung.trim()

    if (pruefungsName && info && beschreibung) {
      fetch("http://localhost:7634/exam", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pruefungsName,
          info,
          beschreibung,
        })
      })
        .then(response => {
          if (!response.ok) {
            if (response.status === 403) {
              props.setLoggedIn(false);
              window.alert('Forbidden: You do not have permission to access this resource.');
              navigate('/login');
              return;
            }
            window.alert('Network response was not ok: ' + response.statusText);
            return;
          }
          return response.json();
        })
        .then(data => {
          if (data) {
            setExams([...exams, data])
            setNewName("")
            setNewInfo("")
            setNewBeschreibung("")
            AppToaster.show({
              message: "Exam added successfully",
              intent: "success",
              timeout: 3000,
            })
          }
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
          AppToaster.show({
            message: "Failed to add exam: " + error.message,
            intent: "danger",
            timeout: 3000,
          });
        });
    } else {
      AppToaster.show({
        message: "All fields are required",
        intent: "warning",
        timeout: 3000,
      });
    }
  };

  const updateExam = id => {
    const exam = exams.find(exam => exam.id === id);

    if (!exam) {
      AppToaster.show({
        message: "Exam not found",
        intent: "warning",
        timeout: 3000,
      });
      return;
    }

    fetch(`http://localhost:7634/exam/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exam),
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 403) {
            props.setLoggedIn(false);
            window.alert('Forbidden: You do not have permission to access this resource.');
            navigate('/login');
            return;  // Stop the execution of further then/catch blocks
          }
          window.alert('Network response was not ok: ' + response.statusText);
          return;  // Stop the execution of further then/catch blocks
        }
        return response.json();
      })
      .then(data => {
        if (data) {  // Ensure that we proceed only if there's valid data returned from the previous then block
          AppToaster.show({
            message: "Exam updated successfully",
            intent: "success",
            timeout: 3000,
          });
        }
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        AppToaster.show({
          message: "Failed to update exam: " + error.message,
          intent: "danger",
          timeout: 3000,
        });
      });
  };


  const deleteExam = async (id) => {
    try {
      const response = await fetch(`http://localhost:7634/exam/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          props.setLoggedIn(false);
          window.alert('Forbidden: You do not have permission to access this resource.');
          navigate('/login');
          return;
        }
        window.alert('Network response was not ok: ' + response.statusText);
        return;
      }

      // Prüfen Sie, ob die Antwort einen Inhalt hat, bevor Sie sie parsen
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      setExams(values => values.filter(item => item.id !== id));
      if (data) {
        AppToaster.show({
          message: 'Exam deleted successfully',
          intent: 'success',
          timeout: 3000,
        });
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      window.alert('An error occurred while deleting the exam. Please try again later.');
    }
  };


  const onChangeHandler = (id, key, value) => {
    setExams(values => {
      return values.map(item =>
        item.id === id ? { ...item, [key]: value } : item
      )
    })
  }

  return (
    <div className="App">
      <table className="bp4-html-table .modifier">
        <thead>
          <tr>
            <th>Id</th>
            <th>Prüfungsname</th>
            <th>Prüfungsinfo</th>
            <th>Prüfungsbeschreibung</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {exams && exams.length > 0 ? (
            exams.map(exam => (
              exam ? (
                <tr key={exam.id}>
                  <td>{exam.id}</td>
                  <td>
                    <EditableText
                      value={exam.pruefungsName}
                      onChange={value => onChangeHandler(exam.id, "pruefungsName", value)}
                    />
                  </td>
                  <td>
                    <EditableText
                      value={exam.info}
                      onChange={value => onChangeHandler(exam.id, "info", value)}
                    />
                  </td>
                  <td>
                    <EditableText
                      value={exam.beschreibung}
                      onChange={value => onChangeHandler(exam.id, "beschreibung", value)}
                    />
                  </td>
                  <td>
                    <Button intent="primary" onClick={() => updateExam(exam.id)}>
                      Update
                    </Button>
                    &nbsp;
                    <Button intent="danger" onClick={() => deleteExam(exam.id)}>
                      Delete
                    </Button>
                    <Button intent="primary" onClick={() => {
                      localStorage.setItem('examId', JSON.stringify({ examId: exam.id }));
                      navigate(`/restapiquestion/${exam.id}`)
                      }}>
                      Add Questions
                    </Button>
                  </td>
                </tr>
              ) : null
            ))
          ) : (
            <tr>
              <td colSpan="5">No exams available</td>
            </tr>
          )}
        </tbody>

        <tfoot>
          <tr>
            <td></td>
            <td>
              <InputGroup
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Prüfungsname hier eingeben..."
              />
            </td>
            <td>
              <InputGroup
                placeholder="Prüfungsinfo hier eingeben..."
                value={newInfo}
                onChange={e => setNewInfo(e.target.value)}
              />
            </td>
            <td>
              <InputGroup
                placeholder="Prüfungsbeschreibung hier eingeben..."
                value={newBeschreibung}
                onChange={e => setNewBeschreibung(e.target.value)}
              />
            </td>
            <td>
              <Button intent="success" onClick={addExam}>
                Add Exam
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default RestApi