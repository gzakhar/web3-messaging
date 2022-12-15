import React from 'react';

interface Contact {
    senderId: string;
    name: string;
}

interface Props {
    contacts: Contact[];
}

function ContactList(props: Props) {

    return (
        <ul className="contact-list">
            {props.contacts.map((contact, id) => {

                return (
                <li key={id} className="contact">
                    <div>{contact.name}</div>
                </li>
                )
            })}


        </ul>
    )

}

export default ContactList