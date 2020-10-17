import React, { SyntheticEvent, useEffect, useState } from "react";
import {
  Container,
  Dimmer,
  Divider,
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Header,
  Loader,
  Table,
} from "semantic-ui-react";
import { Team, ZwiftEvent } from "../../types";
import { getEvents, getEventTeamResult } from "./service";

const rounds: DropdownItemProps[] = [
  {
    key: 1,
    text: "Round 1 - October 12-13",
    value: 1,
  },
  {
    key: 2,
    text: "Round 2 - October 19-20",
    value: 2,
  },
];

function App() {
  const [events, setEvents] = useState<ZwiftEvent[]>([]);
  const [eventList, setEventList] = useState<DropdownItemProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [event, setEvent] = useState<ZwiftEvent>();
  const [eventTeamResult, setEventTeamResult] = useState<Team[]>();
  const [round, setRound] = useState<number>(1);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      const json = await getEvents(round);
      setEvents(json);

      const list = json.map((event: ZwiftEvent) => ({
        key: event.eventId,
        text: event.name,
        value: event.eventId,
      }));
      setEventList(list);

      setIsLoading(false);
    })();
  }, [round]);

  useEffect(() => {
    (async () => {
      if (!event) {
        return;
      }

      setIsLoading(true);
      const json = await getEventTeamResult(event);
      setEventTeamResult(json);
      setIsLoading(false);
    })();
  }, [event]);

  const handleEventChange = (e: SyntheticEvent, { value }: DropdownProps) => {
    setEvent(events.find((event) => event.eventId === value));
  };

  const handleRoundChange = (e: SyntheticEvent, { value }: DropdownProps) => {
    setRound(value as number);
  };

  return (
    <Container style={{ marginTop: "3rem", marginBottom: "3rem" }}>
      <Dimmer active={isLoading}>
        <Loader />
      </Dimmer>

      <Header size="huge">Zwift League - Qualification</Header>
      <Divider />

      <Dropdown
        placeholder="Select round"
        fluid
        search
        selection
        options={rounds}
        onChange={handleRoundChange}
        value={round}
      />

      <Dropdown
        style={{ marginTop: "1rem" }}
        placeholder="Select an event"
        fluid
        search
        selection
        options={eventList}
        onChange={handleEventChange}
        value={event?.eventId}
      />
      <Divider />

      {eventTeamResult && (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>#</Table.HeaderCell>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Individual</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Primes</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Points</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Team</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {eventTeamResult.map((team, pos) => (
              <Table.Row key={team.zlteam}>
                <Table.Cell>{pos + 1}.</Table.Cell>
                <Table.Cell>{team.zlteam}</Table.Cell>
                <Table.Cell textAlign="right">{team.individualpoints}</Table.Cell>
                <Table.Cell textAlign="right">{team.primespoints}</Table.Cell>
                <Table.Cell textAlign="right">{team.points}</Table.Cell>
                <Table.Cell textAlign="right">{team.teampoints}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  );
}

export default App;
