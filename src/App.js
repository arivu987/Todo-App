import React, { useState, useEffect } from 'react';
import { FaCheck, FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/todos');
      const data = await response.json();
      setTodos(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (inputValue.trim() === '') return;

    try {
      const response = await fetch('http://localhost:8000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: inputValue,
          completed: false
        }),
      });

      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setInputValue('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      
      const response = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...todoToUpdate,
          completed: !completed
        }),
      });

      const updatedTodo = await response.json();
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditValue(title);
  };

  const updateTodo = async (id) => {
    if (editValue.trim() === '') return;

    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      
      const response = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...todoToUpdate,
          title: editValue
        }),
      });

      const updatedTodo = await response.json();
      
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      updateTodo(id);
    }
  };

  return (
    <div className="app-container">
      <div className="todo-container">
        <h1>Todo List</h1>
        
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="todo-input"
          />
          <button className="add-button" onClick={addTodo}>
            <FaPlus />
          </button>
        </div>
        
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <ul className="todo-list">
            {todos.length === 0 ? (
              <li className="empty-message">No tasks yet. Add one above!</li>
            ) : (
              todos.map((todo) => (
                <li 
                  key={todo.id} 
                  className={`todo-item ${todo.completed ? 'completed' : ''}`}
                >
                  {editingId === todo.id ? (
                    <div className="edit-container">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, todo.id)}
                        className="edit-input"
                        autoFocus
                      />
                      <button className="save-button" onClick={() => updateTodo(todo.id)}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className="todo-text"
                        onClick={() => toggleComplete(todo.id, todo.completed)}
                      >
                        {todo.title}
                      </span>
                      <div className="todo-actions">
                        <button 
                          className={`complete-button ${todo.completed ? 'completed' : ''}`}
                          onClick={() => toggleComplete(todo.id, todo.completed)}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="edit-button"
                          onClick={() => startEditing(todo.id, todo.title)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;