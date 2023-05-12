import { LoadingContext } from '@/contexts/loading.context';
import { UserContext } from '@/contexts/user.context';
import { StyledPayment } from '@/styles/pagePayment.styles';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-toastify';

const PaymentPage = () => {
  const router = useRouter();

  const userContext = React.useContext(UserContext);

  const loadingContext = React.useContext(LoadingContext);

  const handleFinish = async () => {
    loadingContext.setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) return userContext.userLogout();

      const newRequest = {
        total: Number(
          userContext.cart.reduce((a, b) => {
            return a + b.price;
          }, 0)
        ),
        status: 'Aguardando...',
        itens: userContext.cart.map((el) => ({
          name: el.name,
          count: Number(el.count),
          price: Number(el.price),
          character: el.character || '',
          image: el.image,
        })),
      };

      const request = await toast.promise(
        axios.post(
          '/api/requests/create',
          { ...newRequest },
          { headers: { Authorization: 'Bearer ' + token } }
        ),
        {
          pending: 'Aguardando...',
          success: 'Compra finalizada com sucesso.',
        },
        {
          className: 'my-toast-sucess',
          autoClose: 5000,
        }
      );

      userContext.setCart([]);

      router.push('/order');
    } catch (e: any) {
      toast.error(e.response.data.message, {
        autoClose: 5000,
        className: 'my-toast-error',
      });
    } finally {
      loadingContext.setLoading(false);
    }
  };

  React.useEffect(() => {
    if (userContext.cart.length === 0) router.push('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledPayment>
      <section>
        <h3>
          Para finalizar a compra faça o pagamento de{' '}
          <span style={{ color: 'black' }}>
            {Number(
              userContext.cart.reduce((a, b) => {
                return a + b.price;
              }, 0)
            ).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </h3>

        <div>
          <Image
            src="/image/qrcode.jpg"
            alt="QR Code"
            width={180}
            height={180}
          />
          <p>
            <strong>Instituição: </strong>BCO C6 S.A.
          </p>
          <p>
            <strong>CNPJ: </strong>47.449.484/0001-14
          </p>

          <button onClick={() => handleFinish()}>Confirmar pagamento</button>
        </div>

        <ul>
          <h3>Você está pagando por: </h3>
          {userContext.cart.map((el, i) => (
            <li key={el.name + i}>
              <Image src={el.image} alt={el.name} width={70} height={70} />

              <p>
                <strong>
                  {el.count} {el.name}
                </strong>{' '}
                por{' '}
                <strong>
                  {Number(el.price).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>{' '}
                será enviado para{' '}
                <strong>
                  {el.character ? el.character : userContext.user?.email}
                </strong>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </StyledPayment>
  );
};

export default PaymentPage;