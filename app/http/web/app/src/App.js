import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination'
import Table from 'react-bootstrap/Table'
import Upload from './Upload';
import axios from 'axios';
// import logo from './logo.svg';
import './App.css';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            images: [],
            active_image:null,
            active_classes:null,
            image:null,
            identity:false,
            gender:false,
            age:false,
            expressions:false,
            bbox:false,
            images_per_page:10,
            active_pagination:1,
            pagination_list:[],
            pagination_items:[],
            number_of_images:null,
            active_ann_list:[],
            // host:'http://178.128.213.249:5000',
            host:'http://223.195.37.85:5000',
          };

        this.data = [{cat_id:1,category:"student",superb:"person"}]

        this.handlePagination = this.handlePagination.bind(this);
    }


  componentDidMount() {
      let number_of_images=null;
      axios.get(this.state.host+`/images/length`)
          .then(res => {
            let responses = res.data;
            // console.log("Response",responses);
            number_of_images = responses.len;
            this.setState({ number_of_images });
            // console.log("Number of Images",number_of_images);
            this.load_images(this.state.active_pagination,number_of_images)

          });
  }

  imageClick(image){
        this.setState({active_image:image});
      this.load_annotations(image);

  }
  load_annotations(file_name){
        axios.get(this.state.host+`/image/annotations/`+this.state.active_image)
          .then(res => {
              let response=res.data;
              let active_faces = response.faces;
              this.setState({active_faces});
              let active_ann_list=active_faces.map((item)=>item.id);

              this.setState({active_ann_list});
              console.log(active_faces);
          });
  }

  load_images(active=1,number_of_images=null) {
    let images = [];
    axios.get(this.state.host+`/images`,{
        params:{
            start:active*this.state.images_per_page-this.state.images_per_page,
            end:active*this.state.images_per_page-1
        }
    })
      .then(res => {
        images = res.data;
        this.setState({ images });
        let items=[];
        for (let number = 1; number <= (number_of_images/this.state.images_per_page)+1; number++) {
          items.push(
            <Pagination.Item key={number} active={number === active} onClick={this.handlePagination}>
              {number}
            </Pagination.Item>,
          );
        }
        this.setState({pagination_list:items});
        // console.log(this.state.images);
        this.setState({active_image:images[0]});
        this.load_annotations(images[0].file_name)
      });

  }
  handlePagination(event){
      event.preventDefault();
      this.setState({active_pagination: Number(event.target.text)});
      // console.log(this.state.active_pagination);
      this.load_images(Number(event.target.text),this.state.number_of_images)
  }

  renderPagination() {
    return (
      <Pagination bsSize="small" >{this.state.pagination_list}</Pagination>
    );
  }

  updateAnnList(face){
        if(this.state.active_ann_list.some(item => face.id === item)){
              var array = [...this.state.active_ann_list]; // make a separate copy of the array
              var index = array.indexOf(face.id);
              if (index !== -1) {
                array.splice(index, 1);
                this.setState({active_ann_list: array});
            }
        }
        else{
            var array = [...this.state.active_ann_list];
            array.push(face.id);
            this.setState({active_ann_list: array});
        }

        console.log(this.state.active_ann_list)
  }


  renderAnnotations(){
        if (this.state.active_classes != null){
            return this.state.active_classes.map((face,index) => {
                return (
                    <tr id={index+1}>
                        <td> <Form.Check defaultChecked onClick={()=>this.updateAnnList(face)} type={"checkbox"} label={index+1} /> </td>
                        <td> {face.identity} </td>
                        <td> {face.gender} </td>
                        <td> {face.age} </td>
                        <td> {face.expressions} </td>
                    </tr>
                )

            })
        }
  }

  render() {
    // this.load_images()
    return (
      <Container>
          {/*<Upload />*/}
          <Row >
            <Col md={"auto"} className={"Image-list"} >
                <Row>
                <Container fluid style={{  height:'700px'}}>
                    {/*{ this.state.images.map(image => <Col fluid onClick={()=>{this.imageClick(image)}}><Image fluid width={150} height={150} src={this.state.host+"/thumbs?file_name="+image} thumbnail /></Col>)}*/}
                </Container>
                </Row>

            </Col>
            <Col >
                <Row>
                    <Col>
                    <Image center fluid onChange={()=>console.log("hello")} src={!!(this.state.active_image)?this.state.host+"/image/"+this.state.active_image+"?show-bbox="+this.state.show_bbox+"&show-name="+this.state.show_name+"&show-score="+this.state.show_score+"&hide-face=[]":""} thumbnail />
                    </Col>
                </Row>
                <Row>
                    <Form>
                        <Form.Row>
                            <Form.Check onClick={()=>this.setState(prevState => ({  show_name: !prevState.show_name}))} type={"checkbox"} label={`Name`} />
                            <Form.Check  onClick={()=>this.setState(prevState => ({  show_score: !prevState.show_score}))} type={"checkbox"} label={`Confidence`} />
                            <Form.Check  onClick={()=>this.setState(prevState => ({  show_bbox: !prevState.show_bbox}))} type={"checkbox"} label={`Bounding Box`} />
                        </Form.Row>
                    </Form>
                </Row>
                <Row>
                    <Col>{!!(this.state.active_image)?this.state.active_image:""}</Col>
                </Row>
                <Row>
                    <Form>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Confidence Score</th>
                            </tr>
                          </thead>
                          <tbody>
                           {this.renderAnnotations()}
                          </tbody>
                    </Table>
                    </Form>
                </Row>

            </Col>
          </Row>
        <Row>
            <Container>
                <Pagination bssize="small" >{this.state.pagination_list}</Pagination>
            </Container>
        </Row>
        </Container>
    );
  }
}

export default App;
