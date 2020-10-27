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
import { useWindowHeight } from "@react-hook/window-size";
import { rounds } from "./constants";

const defaultRound = rounds[rounds.length - 1].value as number;

function App() {
  const [events, setEvents] = useState<ZwiftEvent[]>([]);
  const [eventList, setEventList] = useState<DropdownItemProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [event, setEvent] = useState<ZwiftEvent>();
  const [eventTeamResult, setEventTeamResult] = useState<Team[]>();
  const [round, setRound] = useState<number>(defaultRound);

  const windowHeight = useWindowHeight();
  const isDropdownSearchable = windowHeight > 700;

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

      setEvent(undefined);

      setIsLoading(false);
    })();
  }, [round]);

  useEffect(() => {
    (async () => {
      if (!event) {
        setEventTeamResult(undefined);
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
    <Container style={{ padding: "1rem 0" }}>
      <Dimmer active={isLoading}>
        <Loader />
      </Dimmer>

      <Header size="huge">Zwift League Results</Header>
      <Divider />

      <Dropdown
        placeholder="Select round"
        fluid
        search={isDropdownSearchable}
        selection
        options={rounds}
        onChange={handleRoundChange}
        value={round}
      />

      <Dropdown
        style={{ marginTop: "1rem" }}
        placeholder="Select an event"
        fluid
        search={isDropdownSearchable}
        selection
        options={eventList}
        onChange={handleEventChange}
        value={event?.eventId}
      />
      <Divider />

      {eventTeamResult && (
        <Table unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>#</Table.HeaderCell>
              <Table.HeaderCell>Team</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Points</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Primes</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Total</Table.HeaderCell>
              <Table.HeaderCell textAlign="right">Team</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {eventTeamResult.map((team, pos) => (
              <Table.Row key={team.zlteam}>
                <Table.Cell>{pos + 1}.</Table.Cell>
                <Table.Cell>{team.zlteam}</Table.Cell>
                <Table.Cell textAlign="right">
                  {team.individualpoints}
                </Table.Cell>
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
