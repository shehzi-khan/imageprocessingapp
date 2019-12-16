import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination'
import Table from 'react-bootstrap/Table'
import Jumbotron from "react-bootstrap/Jumbotron"
import axios from 'axios';
import './App.css';
import { subscribeToTimer } from './api';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            images: [],
            active_image:null,
            active_faces:null,
            image:null,
            show_label:true,
            show_gender:true,
            show_age:true,
            show_expression:true,
            show_score:true,
            show_bbox:true,
            images_per_page:5,
            active_pagination:1,
            pagination_list:[],
            pagination_items:[],
            number_of_images:null,
            display_images:[],
            active_ann_list:[],
            timestamp: null,
            search:"",
            // host:'http://178.128.213.249:5000',
            host:'http://223.195.37.85:5000',
          };

        this.handlePagination = this.handlePagination.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.interval = setInterval(() => subscribeToTimer((err, data) => this.load_app()), 5000);
    }

  componentDidMount() {
      this.load_app()
  }

  imageClick(image){
        let annotations=this.load_annotations(image);
        annotations.then(res => {
              let response=res.data;
              let active_faces = response.annotation;
              let active_ann_list=response.annotation.map((item ,index)=>index);
              this.setState({active_ann_list});
              this.setState({active_faces});
              return response.annotation;
          });
        this.setState({active_image:image});
  }
  load_annotations(image=this.state.active_image){
        return axios.get(this.state.host+`/image/annotations/`+image);
  }

  load_app(filter=""){
        if (filter){
            filter="?filter="+filter
        }

        axios.get(this.state.host+"/images"+filter)
          .then(res => {
            let images = res.data;
            if (images.length>0) {
                this.setState({images});
            }

          }).then(()=>{
              let pagination_list = this.load_pagination(this.state.active_pagination);
              this.setState({pagination_list});

      }).then(()=>{
          let annotations=this.load_annotations(this.state.images[0]._id);
          annotations.then(res => {
              let response=res.data;
              let active_faces = response.annotation;
              let active_ann_list=response.annotation.map((item ,index)=>index);
              this.setState({active_ann_list});
              this.setState({active_faces});
              return response.annotation;
          });

      }).then(()=>{

            let display_images=this.load_images(this.state.active_pagination);
            this.setState({display_images});
            this.setState({active_image:display_images[0]._id});
      });
  }
  load_images(active){
        let display_images=[];
        let start=(active-1)*this.state.images_per_page;
        let end=(active)*this.state.images_per_page;
        if (start<0){
            start=0
        }
        if (end>this.state.images.length){
            end=this.state.images.length
        }
        display_images=this.state.images.slice(start,end);
        return display_images
  }
  load_pagination(active=1) {
        let items=[];
        for (let number = 1; number <= (this.state.images.length/this.state.images_per_page); number++) {

            items.push(
            <Pagination.Item key={number} active={number === active} onClick={this.handlePagination}>
              {number}
            </Pagination.Item>,
          );
        }
        return items;
  }
  handlePagination(event){
      event.preventDefault();

      if (!isNaN(Number(event.target.text))){
          this.setState({active_pagination: Number(event.target.text)});
          let pagination_list = this.load_pagination(Number(event.target.text));
          this.setState({pagination_list});
          let display_images = this.load_images(Number(event.target.text));
          this.setState({display_images});

          let annotations = this.load_annotations(display_images[0]._id);
          annotations.then(res => {
              let response = res.data;
              let active_faces = response.annotation;
              let active_ann_list = response.annotation.map((item, index) => index);
              this.setState({active_ann_list});
              this.setState({active_faces});
          });
          this.setState({active_image: display_images[0]._id});
      }

  }

  handleSearch(event){
      // event.preventDefault();
      console.log(event.target.value)
      this.load_app(event.target.value);
      }

  renderPagination() {
    return (
      <Pagination bsSize="small" >{this.state.pagination_list}</Pagination>
    );
  }

  updateAnnList(face_index){
        if(this.state.active_ann_list.some(item => face_index === item)){
              var array = [...this.state.active_ann_list]; // make a separate copy of the array
              var index = array.indexOf(face_index);
              if (index !== -1) {
                array.splice(index, 1);
                this.setState({active_ann_list: array});
            }
        }
        else{
            array = [...this.state.active_ann_list];
            array.push(face_index);
            this.setState({active_ann_list: array});
        }
  }


  renderData(){
        if (this.state.active_faces != null){
            return this.state.active_faces.map((face,index) => {
                return {
                    check: <Form.Check defaultChecked onClick={()=>this.updateAnnList(index)} type={"checkbox"} label={index+1} />,
                    label: face.label,
                    gender:!!(face.gender)?face.gender:NaN,
                    age: !!(face.age)?face.age:NaN,
                    expressions: !!(face.expression)?face.expression:NaN
                }
            })
        }
  }

  renderAnnotations(){
        if (this.state.active_faces != null){
            return this.state.active_faces.map((face,index) => {
                return (
                    <tr key={index+1} id={index+1}>
                        <td > <Form.Check defaultChecked onClick={()=>this.updateAnnList(index)} type={"checkbox"} label={index+1} /> </td>
                        <td> {face.label} </td>
                        <td> {!!(face.gender)?face.gender:NaN} </td>
                        <td> {!!(face.age)?face.age:NaN} </td>
                        <td> {!!(face.expression)?face.expression:NaN} </td>
                        {/*<td> {!!(face.score)?face.score:NaN}  </td>*/}
                    </tr>
                )
            })
        }
  }





  render() {
    return (
      <Container >
          {/*<Upload />*/}
          <Row>
              <Col xl={12}>
              <Jumbotron >
                  <h1>
                      Face App
                  </h1>
                  <input type="text" onChange={this.handleSearch} />
              </Jumbotron>
              </Col>
          </Row>
                <Row >
                    { this.state.display_images.map(image => <Col  key={image._id} onClick={()=>{this.imageClick(image._id)}}><Image fluid width={150} height={150} src={this.state.host+"/thumb/"+image._id} thumbnail /></Col>)}

                </Row>
                <Row >
                    <Pagination bssize="small" >{this.state.pagination_list}</Pagination>
                </Row>
                <Row>
                    <Image height={100}  onChange={()=>console.log("hello")} src={!!(this.state.active_image)?this.state.host+"/image/"+this.state.active_image+"?show-bbox="+this.state.show_bbox+"&show-label="+this.state.show_label+"&show-gender="+this.state.show_gender+"&show-age="+this.state.show_age+"&show-expression="+this.state.show_expression+"&show-score="+this.state.show_score+"&hide-face="+this.state.active_ann_list:""} thumbnail />
                </Row>
                <Row>
                    <Form>
                        <Form.Row>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Form.Check defaultChecked onClick={()=>this.setState(prevState => ({  show_label: !prevState.show_label}))} type={"checkbox"} label={`Show Labels  `} />
                            &nbsp;&nbsp;&nbsp;<Form.Check defaultChecked onClick={()=>this.setState(prevState => ({  show_gender: !prevState.show_gender}))} type={"checkbox"} label={`Gender  `} />
                            &nbsp;&nbsp;&nbsp;<Form.Check defaultChecked onClick={()=>this.setState(prevState => ({  show_age: !prevState.show_age}))} type={"checkbox"} label={`Age  `} />
                            &nbsp;&nbsp;&nbsp;<Form.Check defaultChecked onClick={()=>this.setState(prevState => ({  show_expression: !prevState.show_expression}))} type={"checkbox"} label={`Expression  `} />
                            &nbsp;&nbsp;&nbsp;<Form.Check defaultChecked onClick={()=>this.setState(prevState => ({  show_score: !prevState.show_score}))} type={"checkbox"} label={`Confidence  `} />
                            &nbsp;&nbsp;&nbsp;<Form.Check defaultChecked onClick={()=>this.setState(prevState => ({  show_bbox: !prevState.show_bbox}))} type={"checkbox"} label={`Bounding Box`} />
                        </Form.Row>
                    </Form>
                </Row>
                <Row>
                    <Col><span className="font-weight-bold"> Image ID:&nbsp;&nbsp; </span>  {!!(this.state.active_image)?this.state.active_image:""}</Col>
                </Row>
                <Row>
                    <Form>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Gender</th>
                              <th>Age</th>
                              <th>Expression</th>
                              {/*<th>Confidence Score</th>*/}
                            </tr>
                          </thead>
                          <tbody>
                           {this.renderAnnotations()}
                          </tbody>
                    </Table>
                    </Form>
                </Row>

        </Container>
    );
  }
}

export default App;
