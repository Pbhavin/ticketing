import axios from 'axios';
import Link from 'next/link';

const lp = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link
                        className="nav-link"
                        href="/tickets/[ticketId]"
                        as={`/tickets/${ticket.id}`}
                    >
                        show
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>{ticketList}</tbody>
            </table>
        </div>
    );
};

lp.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
};

export default lp;
