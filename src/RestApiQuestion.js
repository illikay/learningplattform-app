import "./App.css";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { createRoot } from "react-dom/client";
import { Button, EditableText, InputGroup, OverlayToaster } from "@blueprintjs/core";

const AppToaster = await OverlayToaster.createAsync({ position: "top" }, {
    domRenderer: (toaster, containerElement) => createRoot(containerElement).render(toaster),
});

const RestAPIQuestion = (props) => {
    const [questions, setQuestions] = useState([]);
    const [newQuestionFrage, setQuestionFrage] = useState("");
    const [newQuestionHinweis, setQuestionHinweis] = useState("");
    const [newQuestionLoesung, setQuestionLoesung] = useState("");
    const [token, setToken] = useState("");
    const [newExamId, setExamId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedExamid = localStorage.getItem('examId');
        if (storedExamid) {
            const parsedExamId = JSON.parse(storedExamid);
            setExamId(parsedExamId.examId);
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setToken(parsedUser.token);
        }
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (newExamId && token) {  // Check if both newExamId and user are set
                console.log("Übertragene ExamId", newExamId);
                console.log("Übertragener Token", token);

                try {
                    const response = await fetch(`http://localhost:7634/exam/${newExamId}/questions`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
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
                    console.log(json);
                    setQuestions(json);
                } catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                    window.alert('An error occurred while fetching the exams. Please try again later.');
                }
            }
        };

        fetchQuestions();
    }, [navigate, props, newExamId, token]);

    const addQuestion = () => {
        const questionFrage = newQuestionFrage.trim();
        const questionHinweis = newQuestionHinweis.trim();
        const questionLoesung = newQuestionLoesung.trim();

        if (questionFrage && questionHinweis && questionLoesung) {
            fetch(`http://localhost:7634/exam/${newExamId}/questions`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questionFrage,
                    questionHinweis,
                    questionLoesung,
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
                        setQuestions([...questions, data]);
                        setQuestionFrage("");
                        setQuestionHinweis("");
                        setQuestionLoesung("");
                        AppToaster.show({
                            message: "Question added successfully",
                            intent: "success",
                            timeout: 3000,
                        });
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    AppToaster.show({
                        message: "Failed to add question: " + error.message,
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

    const updateQuestion = id => {
        const question = questions.find(exam => exam.id === id);

        if (!question) {
            AppToaster.show({
                message: "Exam not found",
                intent: "warning",
                timeout: 3000,
            });
            return;
        }

        fetch(`http://localhost:7634/exam/${newExamId}/questions/${id}`, {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question),
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
                        message: "Question updated successfully",
                        intent: "success",
                        timeout: 3000,
                    });
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                AppToaster.show({
                    message: "Failed to update question: " + error.message,
                    intent: "danger",
                    timeout: 3000,
                });
            });
    };

    const deleteQuestion = async (id) => {
        try {
            const response = await fetch(`http://localhost:7634/exam/${newExamId}/questions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
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

            setQuestions(values => values.filter(item => item.id !== id));
            if (data) {
                AppToaster.show({
                    message: 'Question deleted successfully',
                    intent: 'success',
                    timeout: 3000,
                });
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            window.alert('An error occurred while deleting the question. Please try again later.');
        }
    };

    const onChangeHandler = (id, key, value) => {
        setQuestions(values => {
            return values.map(item =>
                item.id === id ? { ...item, [key]: value } : item
            );
        });
    };

    return (
        <div className="App">
            <table className="bp4-html-table .modifier">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Frage</th>
                        <th>Hinweis</th>
                        <th>Lösung</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {questions && questions.length > 0 ? (
                        questions.map(question => (
                            question ? (
                                <tr key={question.id}>
                                    <td>{question.id}</td>
                                    <td>
                                        <EditableText
                                            value={question.questionFrage}
                                            onChange={value => onChangeHandler(question.id, "questionFrage", value)}
                                        />
                                    </td>
                                    <td>
                                        <EditableText
                                            value={question.questionHinweis}
                                            onChange={value => onChangeHandler(question.id, "questionHinweis", value)}
                                        />
                                    </td>
                                    <td>
                                        <EditableText
                                            value={question.questionLoesung}
                                            onChange={value => onChangeHandler(question.id, "questionLoesung", value)}
                                        />
                                    </td>
                                    <td>
                                        <Button intent="primary" onClick={() => updateQuestion(question.id)}>
                                            Update
                                        </Button>
                                        &nbsp;
                                        <Button intent="danger" onClick={() => deleteQuestion(question.id)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ) : null
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No questions available</td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td>
                            <InputGroup
                                value={newQuestionFrage}
                                onChange={e => setQuestionFrage(e.target.value)}
                                placeholder="Frage hier eingeben..."
                            />
                        </td>
                        <td>
                            <InputGroup
                                placeholder="Hinweis hier eingeben..."
                                value={newQuestionHinweis}
                                onChange={e => setQuestionHinweis(e.target.value)}
                            />
                        </td>
                        <td>
                            <InputGroup
                                placeholder="Lösung hier eingeben..."
                                value={newQuestionLoesung}
                                onChange={e => setQuestionLoesung(e.target.value)}
                            />
                        </td>
                        <td>
                            <Button intent="success" onClick={addQuestion}>
                                Add Question
                            </Button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default RestAPIQuestion;
