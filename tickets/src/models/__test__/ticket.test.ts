import { Ticket } from '../ticket';

it('impliment optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'Pinal',
        price: 10,
        userID: 'abc',
    });

    await ticket.save();

    const ticket1 = await Ticket.findById(ticket.id);

    const ticket2 = await Ticket.findById(ticket.id);

    if (ticket1) {
        ticket1.set({
            price: 20,
        });
    }

    if (ticket2) {
        ticket2.set({
            price: 30,
        });
    }

    await ticket1?.save();

    try {
        await ticket2?.save();
    } catch (e) {
        return;
    }

    throw new Error('Should not reach to this point');
});
