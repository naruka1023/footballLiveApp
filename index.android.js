/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
  ListView,
  Button,
  View,
  Image
} from 'react-native';
import {
  TabNavigator,
} from 'react-navigation';
import  moment from 'moment';

class lastSevenDays extends React.Component {
  
  static navigationOptions = {
    tabBarLabel: 'Last Seven Days',
  };
  render(){
    const {navigate} = this.props.navigation;
    return (
      <Button
      title="Go to Jane's profile"
      onPress={() =>
      navigate('Profile', {name: 'Jane'})}
      />
    )
  }
}
class TodayScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      refreshing: false,
      date:moment().hour(0).minute(0).second(0).subtract(1, 'd').format() + "&to=" + moment().hour(0).minute(0).second(0).add(24, 'h').format(),
      
      getSectionData: (dataBlob, sectionID) => {
        return dataBlob[sectionID];
      },
      getRowData: (dataBlob, sectionID, rowID) => {
        return dataBlob[sectionID + " : " + rowID];
      }
    }
    
    this.callWebService = this.callWebService.bind(this);
    setInterval(() => {
    this.callWebService('https://api.crowdscores.com/v1/matches?from=' + this.state.date);
  }, 60000);
  }
  static navigationOptions = {
    tabBarLabel: 'Today',
  };
  formatApiData(responseJson){
    var competition = null;
           var match = {};
           var dataBlob = {};
           var sectionIDs = [];
           var tempID = [];
           var rowIDs = [];
           var matchIndex = 0;
           var sectionIndex = 0;
           responseJson.forEach((match) => {
             if(competition == null){
                competition = match.competition.dbid;
                sectionIDs.push("s" + sectionIndex);
                dataBlob["s" + sectionIndex] = match.competition;
              }
              if(match.competition.dbid == competition){
                tempID.push("m" + matchIndex);
                dataBlob["s" + sectionIndex + " : " + "m" + matchIndex] = match;
                matchIndex++;
            }else{
                competition = match.competition.dbid;
                sectionIndex += 1;
                dataBlob["s" + sectionIndex] = match.competition;
                matchIndex = 0;
                dataBlob["s" + sectionIndex + " : " + "m" + matchIndex] = match;
                rowIDs = rowIDs;
                tempID = [];
                tempID.push("m" + matchIndex);
                matchIndex++;
                sectionIDs.push("s" + sectionIndex);
                rowIDs.push(tempID);
            }
           },
           rowIDs.push(tempID));
           var returnObject = {
             "dataBlob":dataBlob,
             "sectionIDs":sectionIDs,
             "rowIDs":rowIDs
           };
    return returnObject;
  }
   componentDidMount() {
     this.setState({
            dataSource : new ListView.DataSource({
                getSectionData          : this.state.getSectionData,
                getRowData              : this.state.getRowData,
                rowHasChanged           : (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged : (s1, s2) => s1 !== s2
            }),
           });
     this.callWebService('https://api.crowdscores.com/v1/matches?from=' + this.state.date);
  }
  
  callWebService(givenUrl){
    return fetch(givenUrl,{
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-crowdscores-api-key': '4a4072da3dba4d82b0ccec4b124b8009'
      },
    })
      .then((response) =>  response.json()
      )
      .then((responseJson) => {
        var competitions = "";
           responseJson.forEach((match) =>{
             var id = match.competition.dbid + "";
             var name = match.competition.name + "";
                if(competitions.indexOf(id) == -1){
                  competitions = competitions.concat(id + ",");
                }
           });
           competitions = competitions.slice(0, -1).split(',');
           var sortedResponse = [];
           competitions.forEach((competition) => {
              var competition2 = competition;
              responseJson.forEach((match) => {
                var name = match.competition.name;
                if(competition == match.competition.dbid){
                  sortedResponse.push(match);
                }
              });
           });
           sortedResponse = this.formatApiData(sortedResponse);
           
           this.setState({
            dataSource : this.state.dataSource.cloneWithRowsAndSections(sortedResponse.dataBlob, sortedResponse.sectionIDs, sortedResponse.rowIDs),
            isLoading     : false
           });
      })
      .catch((error) => {
        console.error(error);
      });
  }
  render(){
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{flex: 1, backgroundColor:"gainsboro", marginHorizontal:2}}>
        
        <ListView
          dataSource={this.state.dataSource}
          style={{elevation: 2}}
          renderSectionHeader={
            (sectionData, sectionID) => 
            <View style = {{flex: 1, flexDirection: 'row',borderBottomColor:'grey', borderBottomWidth: StyleSheet.hairlineWidth,justifyContent: 'center',marginTop: 10 ,backgroundColor:'white', paddingVertical: 15 }}>
              <Text style={{textAlign:'right', fontWeight: 'bold', paddingRight: 5 }}>{sectionData.name}</Text>
              <Image source={{uri: sectionData.flagUrl}} style={{width: 20, height: 20}} /></View>}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
          renderRow={(rowData, sectionID, rowID) =>
            <View style={{
              flex:1,
              flexDirection: 'column',
              backgroundColor:'white',
              paddingVertical: 5
              }}>
                <View style={{
                  flex:1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  }}>
                  {rowData.outcome == null && rowData.currentStateStart != null?
                  <View><Text style={{textAlign:'center', fontSize: 10, color: 'green', borderColor: 'black', paddingHorizontal: 2, fontFamily: 'sans-serif-condensed'}}>LIVE</Text></View> 
                  :
                    rowData.outcome != null ?
                      <View><Text style={{textAlign:'right', fontSize: 10,color:'red', fontFamily: 'sans-serif-condensed'}}>FT</Text></View> : null}
                </View>
                
                <View style={{
                  flex:1,
                  flexDirection: 'row', 
                  alignItems: 'center'
                  }}>
                  <View style={{flex:2.5}}><Text style={{textAlign:'right', fontFamily:'san-serif' }}>{rowData.homeTeam.name}</Text></View>
                  {
                    rowData.currentStateStart != null?
                    <View style={{flex:1}}>
                      <Text style={{textAlign:'center'}}>{rowData.homeGoals} - {rowData.awayGoals}</Text>
                    </View>
                    :
                    
                    <View style={{flex:1.5}}>
                      <Text style={{textAlign:'center', fontStyle:'italic', paddingHorizontal: 3,fontFamily: 'sans-serif-thin', fontSize: 10}}>{moment(rowData.start).format('MMM D')}</Text>
                      <Text style={{textAlign:'center', fontStyle:'italic', paddingHorizontal: 3}}>{moment(rowData.start).format('LT')}</Text>
                    </View>
                  } 
                  <View style={{flex:2.5}}><Text style={{textAlign:'left', fontFamily:'sans-serif' }}>{rowData.awayTeam.name}</Text></View>
                </View>
               
            </View>
          }
        
        />
      </View>
    );
  }
}
const footballLiveApp = TabNavigator({
  TodayScreen: { screen: TodayScreen },
  lastSevenDays: { screen: lastSevenDays },
});

const styles = StyleSheet.create({
  separator: {
    flex:1,

    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E'
  }

});

AppRegistry.registerComponent('footballLiveApp', () => footballLiveApp);
