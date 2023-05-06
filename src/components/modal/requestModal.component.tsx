import { UserContext } from '@/contexts/user.context';
import { StyledModal } from '@/styles/modalstyles';
import { TitleH2 } from '@/styles/typography';
import CancelIcon from '@mui/icons-material/Cancel';
import Image from 'next/image';
import React from 'react';

const RequestModal = () => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  const userContext = React.useContext(UserContext);

  const preventSubmit = (event: any) => {
    if (event.key === 'Enter') event.preventDefault();
    if (event.key === 'Escape') {
      event.preventDefault();
      userContext.setModalRequest(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', preventSubmit);
    return () => {
      document.removeEventListener('keydown', preventSubmit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !(modalRef.current as HTMLElement).contains(event.target as HTMLElement)
      ) {
        userContext.setModalRequest(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalRef]);

  return (
    <StyledModal>
      <section className="modal" ref={modalRef}>
        <form>
          <CancelIcon
            fontSize="large"
            color="disabled"
            onClick={(event) => {
              event.preventDefault();
              userContext.setModalRequest(false);
            }}
          />
          <TitleH2 style={{ width: '100%', border: 'none' }}>
            Pedido{' '}
            <span style={{ color: 'black' }}>
              {userContext.requestInfo?.number}
            </span>
          </TitleH2>

          <div>
            <p>
              <strong>Status: </strong>
              {userContext.requestInfo?.status}
            </p>
            <p>
              <strong>Total: </strong>
              {Number(
                userContext.requestInfo?.itens.reduce((a, b) => {
                  return a + Number(b.price);
                }, 0)
              ).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
            <p>
              <strong>Descrição: </strong>
              {userContext.requestInfo?.description}
            </p>
          </div>

          <ul>
            {userContext.requestInfo?.itens.map((el) => (
              <li key={el.id}>
                <Image src={el.image} alt={el.name} width={45} height={45} />
                <p>
                  {el.count} {el.name} por{' '}
                  {Number(el.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </li>
            ))}
          </ul>

          <div>
            <button>Fechar</button>
          </div>
        </form>
      </section>
    </StyledModal>
  );
};

export default RequestModal;
