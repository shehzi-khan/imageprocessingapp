import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
// import logo from './logo.svg';


class Upload extends Component {

    constructor(props) {
        super(props);
        this.state ={
          file:null
        };
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.fileUpload = this.fileUpload.bind(this)
    }


  componentDidMount() {
  }


  onFormSubmit(e){
    e.preventDefault() ;// Stop form submit
    this.fileUpload(this.state.file).then((response)=>{
      console.log(response.data);
    })
  }

  onChange(e) {
    this.setState({file:e.target.files[0]})
  }
  fileUpload(file){
    const url = 'http://0.0.0.0:5000/images/upload';
    const formData = new FormData();
    formData.append('file',file);
    const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
    };
    return  axios.post(url, formData,config)
  }

  render() {
    // this.load_images()
    return (
      <Container>
        <Row>
            <Form onSubmit={this.onFormSubmit}>
                <h1>File Upload</h1>
                <input type="file" onChange={this.onChange} />
                <button type="submit">Upload</button>
              </Form>
        </Row>
        </Container>
    );
  }
}

export default Upload;
