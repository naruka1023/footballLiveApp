export default class lastSevenDays extends React.Component {
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