int RELAYS[] = {D0, D1, D2, D3};
const int num_relays = (sizeof(RELAYS) / sizeof(byte));

// This will hold the relay states
int states[num_relays];
char publishString[150];

void setup()
{
    for (int i = 0; i < num_relays; ++i)
    {
        //Initilize the relay control pins as output
        pinMode(RELAYS[i], OUTPUT);

        // Initialize all relays to an OFF state
        digitalWrite(RELAYS[i], LOW);

        states[i] = 0;
    }

    // register a spark variable
    Particle.variable("states", &states, INT);
    //register the Spark function
    Particle.function("relay", relayControl);
    Particle.function("state", relayState);
    Particle.function("states", relayStates);
}

void loop()
{

}

// command format r1,on
int relayControl(String command)
{
  // parse the relay number
  int relayNumber = command.charAt(1) - '1';

  // do a sanity check
  if (relayNumber < 0 || relayNumber > (num_relays - 1)) return -1;

  int state = states[relayNumber];

  // find out the state of the relay
  if (command.substring(3,5) == "on") state = 1;
  else if (command.substring(3,6) == "off") state = 0;
  else if (command.substring(3,9) == "toggle") state = !state;
  else return -1;

  // Store the value so we can keep track of state
  states[relayNumber] = state;

  // write to the appropriate relay
  digitalWrite(RELAYS[relayNumber], state);
  return state;
}

int relayState(String command)
{
  // parse the relay number
  int relayNumber = command.charAt(1) - '1';

  // do a sanity check
  if (relayNumber < 0 || relayNumber > (num_relays - 1)) return -1;

  int state = states[relayNumber];
  
  return state;
}

int relayStates(String command) 
{
    int relay3 = states[2];
    int relay4 = states[3];

    sprintf(publishString,"{\"Relay3\": %u, \"Relay4\": %u}",relay3,relay4);
    Spark.publish("states",publishString);
}