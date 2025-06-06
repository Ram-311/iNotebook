import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = (props) => {
    const [credentials,setCredentials] = useState({name:"",email:"",password:"",cpassword:""})
    let navigate = useNavigate();
    const handleSubmit= async(e)=>
    { e.preventDefault();
      const  {name,email,password} = credentials
      if(credentials.password!==credentials.cpassword)
      {
        props.showAlert("passwords do not match","danger");
        return;
      }
        const response = await fetch("http://localhost:5000/api/auth/createuser", {
            method: "POST",
            headers:{
              'Content-Type':'application/json'
            },
            body: JSON.stringify({name,email,password})
          });
          const json = await response.json();
          console.log(json);
          if(json.success)
          {
            // Save the auth token and redirect
            localStorage.setItem('token',json.authtoken);
            navigate("/");
            props.showAlert("Account created successfully ","success")
          }
          else{
           props.showAlert("invalid credentials","danger");
          }
       
    }
    const onChange =(e)=>
        {
            setCredentials({...credentials,[e.target.name]: e.target.value})
             
        }
  return (
    <div className="container mt-2">
      <h2 className="my-3">Create an account to use iNotebook</h2>
       <form onSubmit={handleSubmit}>
  <div className="my-3">
    <label htmlFor="name" className="form-label">Name</label>
    <input type="text" className="form-control" id="name" name="name" onChange={onChange} aria-describedby="emailHelp" />
  </div> 
  <div className="mb-3">
    <label htmlFor="email" className="form-label">Email</label>
    <input type="email" className="form-control" id="email" name="email" onChange={onChange} aria-describedby="emailHelp" />
  </div> 
  <div className="mb-3">
    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
    <input type="password" className="form-control" id="password" name="password"  onChange={onChange} minLength={5} required/>
  </div>
  <div className="mb-3">
    <label htmlFor="exampleInputPassword1" className="form-label">Confirm Password</label>
    <input type="password" className="form-control" id="cpassword" name="cpassword" onChange={onChange} minLength={5} required/>
  </div>
  <button type="submit" className="btn btn-primary">Submit</button>
</form>
    </div>
  )
}

export default Signup