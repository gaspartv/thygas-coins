import { LoadingContext } from '@/contexts/loading.context';
import { UserContext } from '@/contexts/user.context';
import { IProductReq } from '@/interfaces/products.interfaces';
import { StyledFormError } from '@/styles/formError.styles';
import { StyledInput } from '@/styles/input.styles';
import { StyledLabel } from '@/styles/label.styles';
import { StyledModal } from '@/styles/modalstyles';
import { TitleH2 } from '@/styles/typography';
import { yupResolver } from '@hookform/resolvers/yup';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';

const CreateProductModal = () => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  const userContext = React.useContext(UserContext);

  const loadingContext = React.useContext(LoadingContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IProductReq>({
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required(),
        price: yup.number().required(),
        description: yup.string().required(),
        stock: yup.number().required(),
        image: yup.string().optional(),
      })
    ),
  });

  const handle = async (data: IProductReq) => {
    loadingContext.setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) return userContext.userLogout();

      for (const key in data) {
        if (data.hasOwnProperty(key) && data[key] === '') {
          delete data[key];
        }
      }

      const res = await toast.promise(
        axios.post('/api/products/create', data, {
          headers: { Authorization: 'Bearer ' + token },
        }),
        {
          pending: 'Aguardando...',
          success: 'Produto cadastrado com sucesso.',
        },
        {
          className: 'my-toast-sucess',
          autoClose: 5000,
        }
      );

      userContext.setProducts([res.data, ...userContext.products]);

      userContext.setModalProductCreate(false);
    } catch ({ response }: any) {
      toast.error(response.data.message, {
        autoClose: 5000,
        className: 'my-toast-error',
      });
    } finally {
      loadingContext.setLoading(false);
    }
  };

  const preventSubmit = (event: any) => {
    if (event.key === 'Enter') event.preventDefault();
    if (event.key === 'Escape') {
      event.preventDefault();
      userContext.setModalProductCreate(false);
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
        userContext.setModalProductCreate(false);
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
        <form onSubmit={handleSubmit(handle)}>
          <CancelIcon
            fontSize="large"
            color="disabled"
            onClick={(event) => {
              event.preventDefault();
              userContext.setModalProductCreate(false);
            }}
          />
          <TitleH2 style={{ width: '150px' }}>Novo produto</TitleH2>
          <div>
            <StyledInput
              {...register('name')}
              id="name"
              name="name"
              type="text"
              placeholder=" "
            />
            <StyledLabel>Nome</StyledLabel>
            <StyledFormError>
              {errors.name && errors.name.message}
            </StyledFormError>
          </div>

          <div>
            <StyledInput
              {...register('price')}
              id="price"
              name="price"
              type="number"
              placeholder=" "
            />
            <StyledLabel>Preço</StyledLabel>
            <StyledFormError>
              {errors.price && errors.price.message}
            </StyledFormError>
          </div>

          <div>
            <StyledInput
              {...register('description')}
              id="description"
              name="description"
              type="text"
              placeholder=" "
            />
            <StyledLabel>Descrição</StyledLabel>
            <StyledFormError>
              {errors.description && errors.description.message}
            </StyledFormError>
          </div>

          <div>
            <StyledInput
              {...register('stock')}
              id="stock"
              name="stock"
              type="number"
              placeholder=" "
            />
            <StyledLabel>Estoque</StyledLabel>
            <StyledFormError>
              {errors.stock && errors.stock.message}
            </StyledFormError>
          </div>

          <div>
            <StyledInput
              {...register('image')}
              id="image"
              name="image"
              type="text"
              placeholder=" "
            />
            <StyledLabel>Imagem</StyledLabel>
            <StyledFormError>
              {errors.image && errors.image.message}
            </StyledFormError>
          </div>

          <div>
            <button type="submit">Adicionar</button>
          </div>
        </form>
      </section>
    </StyledModal>
  );
};

export default CreateProductModal;
