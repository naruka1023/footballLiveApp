export default class TodayScreen extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Today',
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